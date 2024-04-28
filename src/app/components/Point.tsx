import { ReactNode } from "react";
import { Node } from "./Canvas";
import { POINT_RADIUS } from "./constants";


const Point = ({ node, children, isDragging }: { node: Node, children?: ReactNode | ReactNode[], isDragging: boolean }) => {
    return <div
        key={node.id}
        className="absolute  bg-gray-500 rounded-full z-20 flex  justify-center text-gray-700 "
        style={{ left: node.x - POINT_RADIUS, top: node.y - POINT_RADIUS, width: POINT_RADIUS * 2, height: POINT_RADIUS * 2 }}
    >
        {!isDragging && <div className="pt-1  ">{node.id}</div>}
        {!isDragging && children}</div>
}

export default Point;