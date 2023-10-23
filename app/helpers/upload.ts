import * as fs from "fs";
import { converBase64ToImage } from 'convert-base64-to-image'

const BASE_UPLOAD_FOLDER = "./cdn";

function randomString() {
    return (Math.random() * 2).toString(36).substring(2);
}

async function doUpload(base64image, dirname: string = "", filename: string = "", file_type: string = "image") {
    /**
     * Create default folder call "uploads" to store all images if not exits
     * If @var filename is empty, filename will generated automatically
     */
    var callback: any = {
        status: false,
        filename: null
    }
    if (!fs.existsSync(BASE_UPLOAD_FOLDER)) fs.mkdirSync(BASE_UPLOAD_FOLDER)
    if (base64image != "" && dirname != "") {
        if (!fs.existsSync(`${BASE_UPLOAD_FOLDER}/${dirname}`)) {
            fs.mkdirSync(`${BASE_UPLOAD_FOLDER}/${dirname}`, { recursive: true });
        }

        if (filename == "") {
            /**
             * Generate filename with random string
             */
            filename = randomString();
        }

        /**
         * Get file extension
         */
        const _arr = base64image.split(";base64,");
        if (_arr.length > 0) {
            const _base64Header = _arr[0].split("/");
            let _ext = "png";
            if (_base64Header.length > 0) _ext = _base64Header[1];
            if (file_type?.toLowerCase() === "image") {
                const allowdExt = ["png", "jpg", "jpeg", "gif"];
                if (!allowdExt.includes(_ext)) return callback;
            }
            filename += `.${_ext}`;
            /**
             * Convert base64 to file
             */
            converBase64ToImage(base64image, `${BASE_UPLOAD_FOLDER}/${dirname}/${filename}`);
            callback.status = true;
            callback.filename = filename;
        }
    }

    return callback;
}

export {
    randomString,
    doUpload
}