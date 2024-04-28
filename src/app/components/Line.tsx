import { Node } from "./Canvas";
import { LINE_THICKNESS, ONE_UNIT } from "./constants";

interface LineProps {
    startNode: Node;
    endNode: Node;
    id?: string;
}
const Line = ({ startNode, endNode, id }: LineProps) => {
    const length = Math.sqrt(Math.pow(endNode.x - startNode.x, 2) + Math.pow(endNode.y - startNode.y, 2));
    const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
    const angleInDegree = angle * (180 / Math.PI);

    return <div
        key={id}
        className="absolute bg-gray-500  my-2 flex items-center"
        style={{
            left: startNode.x,
            top: startNode.y - LINE_THICKNESS / 2 - 8,
            width: length,
            height: LINE_THICKNESS,
            transform: `rotate(${angle}rad)`,
            transformOrigin: "0% 50%"
        }}
    >
        <div className="group  w-full flex  justify-center items-end h-12 ">
            {length > 0 ?
                <div className="pt-1 group-hover:opacity-100 opacity-0 transition-opacity text-sm"
                    style={{
                        transform: angleInDegree > 90 || angleInDegree < -90 ? `rotate(${180}deg)` : "",
                        transformOrigin: "50% 0%"
                    }}>
                    {(length / ONE_UNIT)?.toFixed(2)} cm</div>
                : null}
        </div>
    </div>

}

export default Line;