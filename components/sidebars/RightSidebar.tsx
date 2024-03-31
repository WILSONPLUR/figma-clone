import React, { useRef } from "react";
import Dimensions from "../settings/Dimensions";
import Text from "../settings/Text";
import Color from "../settings/Color";
import Export from "../settings/Export";
import { RightSidebarProps } from "@/types/type";
import { modifyShape } from "@/lib/shapes";

export const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
}: RightSidebarProps) => {
  const { fontFamily, fontSize, fontWeight, height, width, stroke } =
    elementAttributes;
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);
  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;
    setElementAttributes((prev) => ({ ...prev, [property]: value }));
    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    });
  };
  return (
    <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky h-full max-sm:hidden select-none right-0 overflow-y-auto pb-20">
      <h3 className="px-5 pt-4 text-xs uppercase">Design</h3>
      <span className="text-xs text-primary-grey-300 mt-3 px-5 border-b border-primary-grey-200 pb-4">
        Make changes to canvas as you like
      </span>
      <Dimensions
        isEditingRef={isEditingRef}
        handleInputChange={handleInputChange}
        width={elementAttributes.width}
        height={elementAttributes.height}
      />
      <Text
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontWeight={fontWeight}
        handleInputChange={handleInputChange}
      />
      <Color
        attributeType="fill"
        attribute={elementAttributes.fill}
        placeholder="color"
        inputRef={colorInputRef}
        handleInputChange={handleInputChange}
      />
      <Color
        attributeType="stroke"
        attribute={elementAttributes.stroke}
        placeholder="stroke"
        inputRef={strokeInputRef}
        handleInputChange={handleInputChange}
      />
      <Export />
    </section>
  );
};
