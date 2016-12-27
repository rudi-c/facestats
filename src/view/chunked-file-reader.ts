import { WorkerCommands } from '../analysis/worker-commands'

export default class ChunkedFileReader {
    static CHUNK_SIZE = 10 * 1024 * 1024; // 10 mb chunks

    private currentOffset: number;

    constructor(private file,
                private worker) {
    }

    private readChunk() {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = e => {
                resolve(reader.result);
            };

            console.log("Reading chunk: " + this.currentOffset / ChunkedFileReader.CHUNK_SIZE);
            const slice = this.file.slice(
                this.currentOffset, 
                this.currentOffset + ChunkedFileReader.CHUNK_SIZE
            );
            reader.readAsText(slice);
        })
        .then((result: any) => {
            const isLast = this.currentOffset + ChunkedFileReader.CHUNK_SIZE >= this.file.size;
            this.worker.postMessage(WorkerCommands.parseChunk(result, isLast));
        });
    }

    gotChunk() {
        this.currentOffset += ChunkedFileReader.CHUNK_SIZE;
        // Read the next chunk
        this.readChunk();
    }

    startReading() {
        this.currentOffset = 0;
        // Read the first chunk
        this.readChunk();
    }
}