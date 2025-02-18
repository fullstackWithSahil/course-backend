//fileUploder.js
import axios from "axios";

export default async function deleteFolderInCDN(key:string){
    
    console.log("deleting:",key);
  
    let yourStorageZone="buisnesstool-course";
    const response = await axios.get(
      //url
      //stream
      //headers
      `https://syd.storage.bunnycdn.com/${yourStorageZone}/${key}`,
      {
        headers: {
          AccessKey: "8cb972e1-29b1-4405-9235d083f503-00b0-4b0b",
        },
      }
    );
    if(response.status === 404){
      return;
    }
  
    const promises = response.data.map((file:any)=>new Promise(async(resolve, reject) =>{
      try {
        await axios.delete(
          //url
          //stream
          //headers
          `https://syd.storage.bunnycdn.com/${file.Path}/${file.ObjectName}`,
          {
            headers: {
              AccessKey: "8cb972e1-29b1-4405-9235d083f503-00b0-4b0b",
            },
          }
        )
        resolve("deleted: "+file.ObjectName)
      } catch (error) {
        reject("Failed to delete: "+file.ObjectName)
      }
    }))
  
  
    if (response.data) {
      Promise.all(promises).then(data=>{
        console.log(data);
      })
    } else {
      console.log("error deleting:",key)
    }
  
};