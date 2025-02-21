import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { BsLock } from "react-icons/bs";

const colors = [
  { id: 1, color: "bg-red-500" },
  { id: 2, color: "bg-orange-500" },
  { id: 3, color: "bg-yellow-500" },
  { id: 4, color: "bg-green-500" },
  { id: 5, color: "bg-blue-500" },
  { id: 6, color: "bg-white" },
];

const freeModels = [
  {
    id: 1,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0ATvXYho6SGBAuZt0WqrTrhE6lUlI.png",
    name: "Green Car",
  },
  {
    id: 2,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0ATvXYho6SGBAuZt0WqrTrhE6lUlI.png",
    name: "Blue Car",
  },
  {
    id: 3,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0ATvXYho6SGBAuZt0WqrTrhE6lUlI.png",
    name: "Yellow Car",
  },
  {
    id: 4,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0ATvXYho6SGBAuZt0WqrTrhE6lUlI.png",
    name: "Red Car",
  },
];

const proModels = Array(10)
  .fill()
  .map((_, i) => ({
    id: i + 1,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0ATvXYho6SGBAuZt0WqrTrhE6lUlI.png",
    name: `Pro Model ${i + 1}`,
  }));

export default function ModelViewer() {
  const [selectedColor, setSelectedColor] = useState(null);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Models</h1>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm">
          <FiPlus className="w-4 h-4" />
          Add image
        </button>
      </div>

      {/* Color Picker */}
      <div className="fixed right-4 top-20">
        <div className="flex flex-col gap-2">
          {colors.map((color) => (
            <button
              key={color.id}
              className={`w-6 h-6 rounded-full ${
                color.color
              } transition-transform duration-200 hover:scale-110 
                ${selectedColor === color.id ? "ring-2 ring-white" : ""}`}
              onClick={() => setSelectedColor(color.id)}
            />
          ))}
        </div>
      </div>

      {/* Main Model Display */}
      <div className="aspect-square bg-zinc-900 rounded-xl mb-6 relative">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0ATvXYho6SGBAuZt0WqrTrhE6lUlI.png"
          alt="Main Model"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Free Models */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3">Free Models</h2>
        <div className="grid grid-cols-4 gap-2">
          {freeModels.map((model) => (
            <div
              key={model.id}
              className="aspect-square bg-zinc-800 rounded-xl p-2 hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <img
                src={model.image || "/placeholder.svg"}
                alt={model.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pro Models Section */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3">PRO Models</h2>
        <div className="grid grid-cols-5 gap-2">
          {proModels.slice(0, 5).map((model) => (
            <div
              key={model.id}
              className="aspect-square bg-zinc-800 rounded-xl p-2 relative group cursor-pointer"
            >
              <img
                src={model.image || "/placeholder.svg"}
                alt={model.name}
                className="w-full h-full object-cover rounded-lg opacity-50"
              />
              <BsLock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Pro Models Section 2 */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3">PRO Models</h2>
        <div className="grid grid-cols-5 gap-2">
          {proModels.slice(5, 10).map((model) => (
            <div
              key={model.id}
              className="aspect-square bg-zinc-800 rounded-xl p-2 relative group cursor-pointer"
            >
              <img
                src={model.image || "/placeholder.svg"}
                alt={model.name}
                className="w-full h-full object-cover rounded-lg opacity-50"
              />
              <BsLock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Upgrade for super powers</h3>
          <p className="text-sm text-blue-200">Premium animated 3d models</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg mt-2 font-medium hover:bg-blue-50 transition-colors w-fit">
            GET PRO
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">
          Discard
        </button>
        <button className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}
