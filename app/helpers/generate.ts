function generateZeroNumber(value: number, totalDigit: number = 3) {
    let response: string = "";
    for (let i = 1; i <= totalDigit; i++) {
        if (i === value.toString().length) {
            const zeros: number = totalDigit - i;
            for (let j = 0; j < zeros; j++) {
                response += "0";
            }
            response += value.toString();
            break;
        }
    }
    return response;
}

export {
    generateZeroNumber
}