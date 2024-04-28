import React from 'react';
import { Link, Node } from './Canvas';
import { ANGLE_RADIUS, GRID_POINT_RADIUS } from './constants';
import Circle from 'react-circle';


interface AngleProps {
    linkA: Link;
    linkB: Link;
    nodes: { [id: string]: Node };
    currentNode: Node;
    isDragging: boolean
}

const Angle = ({ linkA, linkB, nodes, currentNode, isDragging }: AngleProps) => {


    const [startNodeA, endNodeA] = linkA.startNodeId === currentNode.id ? [nodes[linkA.endNodeId], nodes[linkA.startNodeId]] : [nodes[linkA.startNodeId], nodes[linkA.endNodeId]]

    const dx1 = startNodeA.x - endNodeA.x;
    const dy1 = startNodeA.y - endNodeA.y;


    const [startNodeB, endNodeB] = linkB.startNodeId === currentNode.id ? [nodes[linkB.endNodeId], nodes[linkB.startNodeId]] : [nodes[linkB.startNodeId], nodes[linkB.endNodeId]]



    const dx2 = startNodeB.x - endNodeB.x;
    const dy2 = startNodeB.y - endNodeB.y;
    const angle2 = Math.atan2(dy2, dx2);
    const angle1 = Math.atan2(dy1, dx1)

    const angle = angle2 - angle1;
    const largeAngle = Math.max(angle2, angle1);
    const largeAngleInDegree = ((largeAngle * 180) / (Math.PI));
    const angleInDegree = ((Math.abs(angle) * 180) / (Math.PI));
    const angleInDegreeRounded = Math.round(angleInDegree);


    const percentageAngle = ((Math.abs(angle) * 100) / (Math.PI * 2));
    const isReflex = percentageAngle > 50;
    const rotationAngle = 90 + (isReflex ? (largeAngleInDegree + 360 - angleInDegree) : largeAngleInDegree);

    if (angleInDegreeRounded === 0 || (angleInDegreeRounded % 30 !== 0 && angleInDegreeRounded % 45 !== 0)) {
        return null;
    }

    return <div className={`group absolute  ${isDragging ? "opacity-0" : "opacity-100"}`} style={{
        left: 0 - ANGLE_RADIUS + GRID_POINT_RADIUS * 4,
        top: 0 - ANGLE_RADIUS + GRID_POINT_RADIUS * 4,
    }} >
        <div
            className=''
            style={{
                transform: `rotate(${rotationAngle}deg) scaleX(-1)`,

            }}>
            <Circle
                progress={isReflex ? 100 - percentageAngle : percentageAngle}
                // progress={100}
                bgColor="transparent"
                progressColor="#6b7280"
                showPercentage={false}
                lineWidth="16px"
                size={ANGLE_RADIUS * 2}

            />
            <div className='absolute -top-1/2 left-2/3  text-gray-700 text-xs' style={{
                transform: `rotate(${rotationAngle}deg) scaleX(-1)`,

            }}>{isReflex ? 360 - angleInDegreeRounded : angleInDegreeRounded}°</div>
        </div>


    </div>;
};

export default Angle;