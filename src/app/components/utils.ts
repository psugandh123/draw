import { Link } from "./Canvas";
import { GRID_LENGTH } from "./constants";

export const getNextPointName = (usedChars: string[]): string => {
    const startChar = 'A'.charCodeAt(0);
    let nextCharCode = startChar;

    while (true) {
        const nextChar = String.fromCharCode(nextCharCode);
        if (!usedChars.includes(nextChar)) {
            return nextChar;
        }

        nextCharCode++;
        if (nextCharCode > 'Z'.charCodeAt(0)) {
            nextCharCode = startChar;
        }
    }
};

export const removeDuplicateLinks = (links: Link[]): Link[] => {
    const uniqueLinks = new Set<string>();
    const result: Link[] = [];

    for (const link of links) {
        const key = `${link.startNodeId}-${link.endNodeId}`;
        const reverseKey = `${link.endNodeId}-${link.startNodeId}`;

        if (!uniqueLinks.has(key) && !uniqueLinks.has(reverseKey)) {
            uniqueLinks.add(key);
            result.push(link);
        }
    }

    return result;
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
