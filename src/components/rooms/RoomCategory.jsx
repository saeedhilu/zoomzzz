import React from "react";
import image from '../../assets/menu.png'
const RoomCategory = ({ category }) => {
  return (
    <div className=" bg-slate-100 p-4 shadow-lg rounded-sm  w-36">
      <div className="img-div w-10 m-auto">
        <img src={image} alt="catogary image" />
      </div>
      <h2 className="font-semibold text-center">
        {category}
      </h2>
    </div>
  );
};

export default RoomCategory;
