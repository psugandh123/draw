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
export type InteractionEvent = React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>;

const getClient = (e: InteractionEvent) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();
    return 'changedTouches' in e ? e.changedTouches[0] : e

}
export const getCoordinates = (e: InteractionEvent) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = getClient(e);


    const x = clientX - canvasRect.left;
    const y = clientY - canvasRect.top;
    console.log(x, x / GRID_LENGTH - 0.5, Math.round((x / GRID_LENGTH - 0.5)))

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

export const isActionWIthinCanvas = (e: InteractionEvent) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = getClient(e);



    return clientX >= canvasRect.left &&
        clientX <= canvasRect.right &&
        clientY >= canvasRect.top &&
        clientY <= canvasRect.bottom
}
