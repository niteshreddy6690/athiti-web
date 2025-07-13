import {
  useEffect,
  useRef,
  useState,
} from "react";
import Portal from "../Portal";
import {
  X,
} from "lucide-react";
import useFetcher from "../../hooks/useFetcher";
import React from "react";
import { API_URL } from '../../utils/constants'; 


const OnboardGuest = ({ isOpen, onClose }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfPeople: '',
    checkInDate: '',
    checkOutDate: '',
    status: '',
    rooms: []
  });

  const { data: AvailableRooms, loading, error } = useFetcher("/room/all/available", {
    method: "GET",
    initialData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
 
  });

  const modalRef = useRef(null); 

  const handleOutsideClick = (event) => { // Removed TypeScript annotation
    if (modalRef.current === event.target) {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

const response =await fetch(`${API_URL}${"/guest"}`,{method: "POST", // or "PUT", depending on your API
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),})
       if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }
        const data = await response.json();
    console.log("Success:", data);
   
     onClose();
  };

  useEffect(() => {
    const handleEscape = (event) => { // Removed TypeScript annotation
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 flex items-center justify-center z-[1000] px-4"
        style={{ backgroundColor: "#101010CC" }}
        onClick={handleOutsideClick}
        ref={modalRef}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Onboard Guest</h2>
        
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter guest name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter guest email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter guest phone number"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
         People
              </label>
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter room number"
              />
            </div>
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Check-in Date
              </label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div> */}

            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Check-out Date
              </label>
              <input
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div> */}

            <div className="mb-4">
              {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label> */}
          {/* <Select
            options={[
              { label: "Checked-in", value: "checked-in" },
              { label: "Checked-out", value: "checked-out" },
            ]}
            onChange={(selectedOption) =>
              setFormData(prev => ({
                ...prev,
                status: selectedOption ? selectedOption.value : ""
              }))
            }
            value={
              [
                { label: "Checked-in", value: "checked-in" },
                { label: "Checked-out", value: "checked-out" },
              ].find(opt => opt.value === formData.status)
            }
            placeholder="Select status"
          /> */}
            </div>
            {/* <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Rooms
              </label>
              
              {loading && (
                <div className="text-sm text-gray-500">Loading available rooms...</div>
              )}
              
              {error && (
                <div className="text-sm text-red-500">Error loading rooms: {error.message}</div>
              )}
              
              {AvailableRooms && AvailableRooms.length > 0 && (
                <Select
                  options={AvailableRooms.map((room) => ({
                    value: room._id,
                    label: `Room ${room.roomNumber } - ${room.roomType} (${room.capacity} guests)`,
                  }))}
                  placeholder="Select available rooms"
                  className="w-full"
                  isMulti={true}
                  onChange={(selectedOptions: Array<{ value: string; label: string }> | null) =>
                    setFormData(prev => ({
                      ...prev,
                      rooms: selectedOptions && selectedOptions.map(opt => opt.value)
                    }))
                  }
                />
              )}
              
              {AvailableRooms && AvailableRooms.length === 0 && (
                <div className="text-sm text-gray-500">No available rooms found</div>
              )}
            </div> */}
                
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Submit'}
            </button>
          </form>
        </div>  
      </div>
    </Portal>
  );
};

export default OnboardGuest;