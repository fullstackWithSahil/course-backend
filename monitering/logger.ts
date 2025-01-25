class Logger{
    private env: string;

    constructor(){
        this.env = process.env.ENV||'development';
    }
    async info(data:any){
        try {
            if(this.env=="development"){
                console.log(data)
            }else{
                console.log("have to imlement logging properly...")
            }
        } catch (error) {
            console.log("there was an error in logging system")
        }
    }

    async error(data:any){
        try {
            if(this.env=="development"){
                console.log(data)
            }else{
                console.log("have to imlement logging properly...")
            }
        } catch (error) {
            console.log("there was an error in logging system")
        }
    }
    
    async warning(data:any){
        try {
            if(this.env=="development"){
                console.log(data)
            }else{
                console.log("have to imlement logging properly...")
            }
        } catch (error) {
            console.log("there was an error in logging system")
        }
    }
}

const logger = new Logger();

export default logger;