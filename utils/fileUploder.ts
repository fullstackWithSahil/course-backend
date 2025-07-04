//fileUploder.js
import axios from "axios";
import fs from "fs";

export default async function fileUploder(filePath:string,key:string){
  const fileStream = fs.createReadStream(filePath);

  let yourStorageZone="buisnesstool-course";
  const response = await axios.put(
    //url
    //stream
    //headers
    `https://syd.storage.bunnycdn.com/${yourStorageZone}/${key}`,
    fileStream,
    {
      headers: {
        AccessKey: "4bf30c6a-4924-41f6-bb822899ea28-858d-465e",
      },
    }
  );

  if (response.data) {
    return `https://buisnesstools-course.b-cdn.net/${key}`;
  } else {
    return false;
  }
};