//fileUploder.js
import axios from "axios";
import fs from "fs";

export default async function fileUploder(filePath:string,key:string){
  const fileStream = fs.createReadStream(filePath);
  const uniqueFilename = key;

  let yourStorageZone="development-courses";
  const response = await axios.put(
    //url
    //stream
    //headers
    `https://syd.storage.bunnycdn.com/${yourStorageZone}/${uniqueFilename}`,
    fileStream,
    {
      headers: {
        AccessKey: "c33ffc82-80e6-48b0-a1f483690dfd-19e5-4aa3",
      },
    }
  );

  if (response.data) {
    return `https://buisnesstools-course.b-cdn.net/${uniqueFilename}`;
  } else {
    return false;
  }
};