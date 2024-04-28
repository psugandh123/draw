import { GRID_LENGTH } from "./constants";

export const getNextPointName = (numPoints: number): string => {
    const startChar = 'A'.charCodeAt(0);
    const nextCharCode = startChar + numPoints;

    if (nextCharCode <= 'Z'.charCodeAt(0)) {
        return String.fromCharCode(nextCharCode);
    } else {
        // Handle the case when we've exceeded 'Z'
        const overflow = nextCharCode - 'Z'.charCodeAt(0) - 1;
        const nextChar = String.fromCharCode(startChar + overflow);
        return `${nextChar}'`;
    }
};


export const getCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    return {
        relative: {
            x, y
        },
        closest: {
            x: (Math.round((x / GRID_LENGTH - 0.5)) + 0.5) * GRID_LENGTH,
            y: (Math.round((y / GRID_LENGTH - 0.5)) + 0.5) * GRID_LENGTH,
        }
    }
}
