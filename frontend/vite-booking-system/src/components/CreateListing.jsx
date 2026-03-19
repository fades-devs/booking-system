import { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";

const ROOM_API_URL = import.meta.env.VITE_ROOM_API_URL;

const CreateListing = () => {
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState([]);
  const { getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCreate = async (e) => {
    e.preventDefault();

    // create formdata object instead of normal json
    const formData = new FormData();
    formData.append("title", title);
    formData.append("capacity", capacity);
    formData.append("basePrice", basePrice);
    formData.append("location", location);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${ROOM_API_URL}/api/v1/room`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multi-part/form-data",
          },
        },
      );
      toast.success("Room created successfully!");
    } catch (err) {
      console.log("Failed to create room:", err);
      setError(err);
      toast.error("Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-12">
      <h2 className="text-2xl font-bold mb-6 border-b border-slate-100 pb-4">
        Create New Room Listing
      </h2>
      <form onSubmit={handleCreate} className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2">
              Room Title
            </label>
            <input
              type="text"
              placeholder="Enter room title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2">
              Room Capacity
            </label>
            <input
              type="text"
              placeholder="Enter room capacity..."
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2">
              Room Price
            </label>
            <input
              type="text"
              placeholder="Enter room base price..."
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2">
              Room Location
            </label>
            <input
              type="text"
              placeholder="Enter room location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 mb-2">
              Room Pictures (Up to 3)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 transition-all
                            file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100
                            file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
        </div>
        {/* Submit button */}
        <button
          type="submit"
          className="mt-8 bg-slate-900 text-white font-medium py-3 px-8 rounded-lg hover:bg-slate-800 hover:scale-102 transition-all self-start w-full sm:w-auto cursor-pointer shadow-sm"
        >
          Create listing
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
