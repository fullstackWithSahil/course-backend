//fileUploder.js
import axios from "axios";
import fs from "fs";

export default async function fileUploder(filePath:string,key:string){
  const fileStream = fs.createReadStream(filePath);
  const uniqueFilename = key;

  let yourStorageZone="buisnesstool-course";
  const response = await axios.put(
    //url
    //stream
    //headers
    `https://syd.storage.bunnycdn.com/${yourStorageZone}/${uniqueFilename}`,
    fileStream,
    {
      headers: {
        AccessKey: "8cb972e1-29b1-4405-9235d083f503-00b0-4b0b",
      },
    }
  );

  if (response.data) {
    return `https://buisnesstools-course.b-cdn.net/${uniqueFilename}`;
  } else {
    return false;
  }
};