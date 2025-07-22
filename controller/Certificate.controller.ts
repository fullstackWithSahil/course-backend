import type { Request, Response } from "express";
import qrcode from "qrcode";
import path from "node:path";
import fileUploder from "../utils/fileUploder";
import fs from "node:fs/promises";
import puppeteer from "puppeteer";
import axios from "axios";

export async function generateCertificate(req: Request, res: Response) {
	try {
		const { name, course, teacher } = req.body;

		//generate the verification link
		const userKey = Bun.hash(`${name}:${teacher}`);
		const verificationUrl = `https://syd.storage.bunnycdn.com/buisnesstool-course/certificate/${userKey}`;
		await qrcode.toFile(`qr-${userKey}.png`, verificationUrl);

		//uplode qr to storage and get the link
		const pathToqr = path.join(__dirname, `../qr-${userKey}.png`);
		const qrUrl = await fileUploder(pathToqr, `qrs/qr-${userKey}.png`);
		await fs.unlink(pathToqr);

		//download the html file form the bunny storage
		const { data }: { data: string } = await axios.get(
			"https://buisnesstools-course.b-cdn.net/templete/temp.html",
			{
				headers: {
					accept: "*/*",
					AccessKey: "4bf30c6a-4924-41f6-bb822899ea28-858d-465e",
				},
			}
		);
		//change the name,course and qrcode
		const nameAdded = data.replace("{{STUDENT_NAME}}", name);
		const qrAdded = nameAdded.replace("{{QR_CODE_URL}}", qrUrl || "");

		//generate pdf using puppetier
		let browser;
		browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		const page = await browser.newPage();

		// Set the HTML content
		await page.setContent(qrAdded, {
			waitUntil: "networkidle0",
		});

		// Generate PDF
		const pdfBuffer = await page.pdf({
			format: "A4",
			landscape: false,
			printBackground: true,
			margin: {
				top: "20px",
				bottom: "20px",
				left: "20px",
				right: "20px",
			},
		});

		// Create output directory if it doesn't exist
		const outputDir = "./output";
		const exist = await fs.exists(outputDir);
		if (!exist) {
			await fs.mkdir(outputDir, { recursive: true });
		}

		// Generate unique filename with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `document-${timestamp}.pdf`;
		const filePath = path.join(outputDir, filename);

		// Save PDF to local storage
		await fs.writeFile(filePath, pdfBuffer);
		//uplode the pdf to storage
        const pdfUrl = await fileUploder(filePath,`certificate/${userKey}.pdf`)
        //delete the file
        await fs.unlink(filePath)
		//send the download link to user
		res.json({ pdfUrl });
	} catch (error) {
		console.log("There was an error generating the certificate");
		res.json({
			success: false,
			message: error,
		});
	}
}
