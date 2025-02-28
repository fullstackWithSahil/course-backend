export type statsType= {
    cpu: {
        avg?: undefined;
        max?: undefined;
        min?: undefined;
    };
    memory: {
        avg?: undefined;
        max?: undefined;
        min?: undefined;
    };
} | {
    cpu: {
        avg: string;
        max: string;
        min: string;
    };
    memory: {
        avg: string;
        max: string;
        min: string;
    };
}

export type responseTypes ={
    cpu_usage:any;
    memory_usage_gb:any;
}