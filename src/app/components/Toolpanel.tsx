import React from "react";
import { LINE_THICKNESS, POINT_RADIUS, TOOLS } from "./constants";
interface ToolpanelProps {
    setCurrentTool: React.Dispatch<React.SetStateAction<string>>;
    currentTool: string;
}

const Toolpanel = ({ setCurrentTool, currentTool }: ToolpanelProps) => {
    return <div className="w-full bg-[#FCF6D7] rounded p-4  shadow"
        onClick={(e) => {
            e.stopPropagation()
            setCurrentTool("")
        }}>
        <div className={`${currentTool === TOOLS.LINE ? "bg-yellow-300" : ""} px-2 h-10 w-10 inline-flex items-center relative cursor-pointer `}
            onClick={(e) => {
                e.stopPropagation()
                setCurrentTool(TOOLS.LINE)
            }}>
            <div className={` h-0.5 w-full relative flex items-center bg-gray-500`} >
                <div className=" aspect-square bg-gray-500 absolute rounded-full"
                    style={{
                        width: POINT_RADIUS * 2,
                    }}></div>
                <div className=" aspect-square bg-gray-500 absolute right-0 rounded-full"
                    style={{
                        width: POINT_RADIUS * 2,
                    }}></div>
            </div>


        </div>
    </div>


}
export default Toolpanel;