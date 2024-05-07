import { ReactNode } from "react";
import { Node } from "./Canvas";
import { POINT_RADIUS, TOOLS } from "./constants";


const Point = ({ node, children, currentTool }: { node: Node, children?: ReactNode | ReactNode[], currentTool: string }) => {
    return <div
        key={node.id}
        className={`absolute bg-gray-500 rounded-full z-20 flex  justify-center text-gray-700 ${currentTool === TOOLS.LINE ? "" : currentTool === TOOLS.MOVE ? "cursor-move" : ""} `}
        style={{ left: node.x - POINT_RADIUS, top: node.y - POINT_RADIUS, width: POINT_RADIUS * 2, height: POINT_RADIUS * 2 }}
    >
        {<div className="pt-1  ">{node.id}</div>}
        {children}
    </div>
}

export default Point;