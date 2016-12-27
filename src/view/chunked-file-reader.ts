import { WorkerCommands } from '../analysis/worker-commands'

import { Actions } from '../actions'

export default class ChunkedFileReader {
    static CHUNK_SIZE = 2 * 1024 * 1024; // 2 mb chunks

    private currentOffset: number;

    constructor(private file,
                private worker,
                private dispatch) {
    }

    private readChunk() {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = e => {
                resolve(reader.result);
            }

            // console.log("Reading chunk: " + this.currentOffset / ChunkedFileReader.CHUNK_SIZE);
            const slice = this.file.slice(
                this.currentOffset,
                this.currentOffset + ChunkedFileReader.CHUNK_SIZE
            );
            reader.readAsText(slice);
        })
        .then((result: any) => {
            const isLast = this.currentOffset + ChunkedFileReader.CHUNK_SIZE >= this.file.size;
            this.worker.postMessage(WorkerCommands.parseChunk(result, isLast));
            const progress = Math.min(1.0,
                (this.currentOffset + ChunkedFileReader.CHUNK_SIZE) / this.file.size);
            this.dispatch(Actions.updateProgress(progress));
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