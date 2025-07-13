/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, User, Calendar, ClipboardList, CheckCircle, AlertCircle, Eye, Edit3 } from 'lucide-react';
import useFetch from '@/hooks/useFetcher';
import { API_URL } from '@/utils/constants';

interface NewErrors {
  name?: string;
  email?: string;
  phone?: string;
  numberOfPeople?: string;
  roomId?: string;
  checkInTime?: string;
  auditedBy?: string;
}

const GuestOnboardingSystem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  interface FormDataType {
    guest: {
      name: string;
      email: string;
      phone: string;
      numberOfPeople: number;
    };
    booking: {
      roomId: string;
      checkInTime: string;
      checkOutTime: string;
      duration: number;
      totalCharges: number;
    };
    audit: {
      auditType: string;
      auditedBy: string;
      items: any[];
      totalCharges: number;
      notes: string;
    };
  }

  const [formData, setFormData] = useState<FormDataType>({
    // Guest Data
    guest: {
      name: '',
      email: '',
      phone: '',
      numberOfPeople: 1
    },
    // Booking Data
    booking: {
      roomId: '',
      checkInTime: '',
      checkOutTime: '',
      duration: 0,
      totalCharges: 0
    },
    // Audit Data
    audit: {
      auditType: 'check-in',
      auditedBy: 'System',
      items: [],
      totalCharges: 0,
      notes: ''
    }
  });

const [errors, setErrors] = useState<NewErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const[roomProducts,setRoomProducts]=useState([])

  // Mock data for rooms and products

  const { data:rooms, loading, error } = useFetch("/room/all/available");


  // const [rooms] = useState([
  //   { id: '1', name: 'Deluxe Room 101', type: 'Deluxe', price: 150 },
  //   { id: '2', name: 'Standard Room 201', type: 'Standard', price: 100 },
  //   { id: '3', name: 'Suite Room 301', type: 'Suite', price: 250 }
  // ]);

  // const [roomProducts] = useState([
  //   { id: '1', name: 'Towels', category: 'Linens', baseCondition: 'good', replacementCost: 25 },
  //   { id: '2', name: 'Bed Sheets', category: 'Linens', baseCondition: 'good', replacementCost: 40 },
  //   { id: '3', name: 'Pillow', category: 'Linens', baseCondition: 'good', replacementCost: 30 },
  //   { id: '4', name: 'TV Remote', category: 'Electronics', baseCondition: 'good', replacementCost: 15 },
  //   { id: '5', name: 'Mini Fridge', category: 'Appliances', baseCondition: 'good', replacementCost: 200 },
  //   { id: '6', name: 'Coffee Maker', category: 'Appliances', baseCondition: 'good', replacementCost: 80 },
  //   { id: '7', name: 'Hair Dryer', category: 'Amenities', baseCondition: 'good', replacementCost: 50 },
  //   { id: '8', name: 'Bathrobes', category: 'Amenities', baseCondition: 'good', replacementCost: 60 }
  // ]);



  const fetchAllRoomProducts=useCallback(async function getAllTheRoomProducts(){
    if(formData?.booking?.roomId){
      const response= await fetch(`${API_URL}/room-product/room/${formData?.booking?.roomId}`)
      const data= await response.json()
    console.log("roomProducts",roomProducts)
     setRoomProducts(data)


    const initialAuditItems = data.map(product => ({
        roomProductId: product._id,
        productName: product?.productId?.name,
        conditionBefore: product.baseCondition||"good",
        conditionAfter: product.baseCondition||"fair",
        quantity: 1,
        notes: '',
        chargeAmount: 0,
        replacementCost: product.productId.brokenCost
      }));
      
      setFormData(prev => ({
        ...prev,
        audit: {
          ...prev.audit,
          items: initialAuditItems
        }
      }));
       console.log("initialAuditItems",initialAuditItems)
    }
  },[formData.booking.roomId]
)

useEffect(()=>{
  if(formData?.booking.roomId){
    fetchAllRoomProducts()
  }
},[formData.booking.roomId])
  const steps = [
    { id: 1, title: 'Guest Information', icon: User },
    { id: 2, title: 'Room Booking', icon: Calendar },
    { id: 3, title: 'Room Audit', icon: ClipboardList },
    { id: 4, title: 'Confirmation', icon: CheckCircle }
  ];

  const conditionOptions = ['good', 'fair', 'damaged', 'broken'];


  useEffect(() => {
    const totalCharges = formData.audit.items.reduce((sum, item) => sum + item.chargeAmount, 0);
    setFormData(prev => ({
      ...prev,
      audit: {
        ...prev.audit,
        totalCharges
      }
    }));
  }, [formData.audit.items]);

  const validateStep = (step: number) => {
    const newErrors: NewErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.guest.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.guest.email?.trim()) newErrors.email = 'Email is required';
        if (!formData.guest.phone?.trim()) newErrors.phone = 'Phone is required';
        if (formData.guest.numberOfPeople < 1) newErrors.numberOfPeople = 'Number of people must be at least 1';
        break;
      case 2:
        if (!formData.booking.roomId) newErrors.roomId = 'Room selection is required';
        if (!formData.booking.checkInTime) newErrors.checkInTime = 'Check-in time is required';
        break;
      case 3:
        if (!formData.audit.auditedBy?.trim()) newErrors.auditedBy = 'Auditor name is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAuditItemChange = (index, field, value) => {
    const updatedItems = [...formData.audit.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate charge amount if condition changed
    if (field === 'conditionAfter') {
      const item = updatedItems[index];
      let chargeAmount = 0;
      
      if (value === 'damaged') {
        chargeAmount = item.replacementCost * 0.5; // 50% charge for damaged
      } else if (value === 'broken') {
        chargeAmount = item.replacementCost; // Full charge for broken
      }
      
      updatedItems[index].chargeAmount = chargeAmount;
    }



    setFormData(prev => ({
      ...prev,
      audit: {
        ...prev.audit,
        items: updatedItems
      }
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitForm = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {

    const guestBooking= await fetch(`${API_URL}/guest`,{
       method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
   body: JSON.stringify(formData.guest),
    })
    
    
 const createdGuest=  await guestBooking.json()
  const guestId= await createdGuest?._id

console.log("guestId",guestId)
let RoomBookingDetails
 if(guestId &&formData?.booking ){


  console.log(" formData?.booking", formData?.booking)
  const RoomBookingResponse= await fetch(`${API_URL}/booking`,{
       method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
   body: JSON.stringify({...formData.booking,
    guestId,
    status:"checked-in",
    auditStatus: {
        checkIn: {
            required: true,
            completed: false,
            auditId: null,
            completedAt: null,
            completedBy: null
        },
        checkOut: {
            required: true,
            completed: false,
            auditId: null,
            completedAt: null,
            completedBy: null
        }
    },
   }),
    })
    RoomBookingDetails=await RoomBookingResponse.json()
 }

   let auditItemIds 
  let totalCharges
  let allProductAitemAuditValues
 if(RoomBookingDetails && formData?.audit){

 const allProductAitemAudit = await Promise.allSettled(
  formData?.audit?.items?.map(item =>
    fetch(`${API_URL}/audit-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item)
    }).then(res => res.json()) // Extract JSON from each response
  )
);

auditItemIds = allProductAitemAudit
  .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
  .map(result => result.value?._id); 

totalCharges = allProductAitemAudit
  .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value?._id)
  .reduce((acc, curr) => acc + (curr.value ?? 0), 0);

allProductAitemAuditValues = allProductAitemAudit
  .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled') 
  .map(result => result.value); 

 }


 if( auditItemIds && allProductAitemAuditValues){

const auditDetails=await fetch(`${API_URL}/audit`,{
       method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
   body: JSON.stringify({
    bookingId:RoomBookingDetails?._id,
    roomId:formData?.booking.roomId,
    guestId,
    items:allProductAitemAuditValues,
    totalCharges:totalCharges||0,
    auditedBy:formData?.audit?.auditedBy,
    auditType:formData?.audit?.auditType,
    status:"completed",
    note:formData?.audit?.notes,
   })
})
console.log("auditDetails",await auditDetails.json())
 }



 
     
      

      alert('Booking and audit completed successfully!');
      
      // Reset form
      setFormData({
        guest: { name: '', email: '', phone: '', numberOfPeople: 1 },
        booking: { roomId: '', checkInTime: '', checkOutTime: '', duration: 0, totalCharges: 0 },
        audit: { auditType: 'check-in', auditedBy: 'System', items: [], totalCharges: 0, notes: '' }
      });
      setCurrentStep(1);
      setErrors({name:""});
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.guest.name}
                  onChange={(e) => handleInputChange('guest', 'name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.guest.email}
                  onChange={(e) => handleInputChange('guest', 'email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.guest.phone}
                  onChange={(e) => handleInputChange('guest', 'phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.guest.numberOfPeople}
                  onChange={(e) => handleInputChange('guest', 'numberOfPeople', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.numberOfPeople && <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</p>}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Booking</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Room *
                </label>
                <div className="grid md:grid-cols-5 gap-4 overflow-hidden">
                  {rooms?.map(room => (
                    <div
                      key={room._id}
                      onClick={() => handleInputChange('booking', 'roomId', room._id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.booking.roomId === room._id
                          ? 'border-blue-500 bg-blue-50'
                          : `${room.status==="available"?'border-green-400 hover:border-green-400':'border-gray-300 hover:border-gray-400'}`
                      }` }
                    >
                      <h3 className="font-semibold text-gray-900">{room.roomNumber}</h3>
                      <p className="text-sm text-gray-600">{room.roomType}</p>
                      {/* <p className="text-lg font-bold text-blue-600">${room._id}/night</p> */}
                    </div>
                  ))}
                </div>
                {errors.roomId && <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.booking.checkInTime}
                  onChange={(e) => handleInputChange('booking', 'checkInTime', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.checkInTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.checkInTime && <p className="text-red-500 text-sm mt-1">{errors.checkInTime}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.booking.checkOutTime}
                  onChange={(e) => handleInputChange('booking', 'checkOutTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {formData.booking.roomId && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Room:</span> {rooms.find(r => r.id === formData.booking.roomId)?.name}</p>
                  <p><span className="font-medium">Guest:</span> {formData.guest.name}</p>
                  <p><span className="font-medium">People:</span> {formData.guest.numberOfPeople}</p>
                  <p><span className="font-medium">Check-in:</span> {formData.booking.checkInTime}</p>
                  {formData.booking.checkOutTime && (
                    <p><span className="font-medium">Check-out:</span> {formData.booking.checkOutTime}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Audit</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Type
                </label>
                <select
                  value={formData.audit.auditType}
                  onChange={(e) => handleInputChange('audit', 'auditType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="check-in">Check-in Audit</option>
                  <option value="check-out">Check-out Audit</option>
                  <option value="maintenance">Maintenance Audit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audited By *
                </label>
                <input
                  type="text"
                  value={formData.audit.auditedBy}
                  onChange={(e) => handleInputChange('audit', 'auditedBy', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.auditedBy ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter auditor name"
                />
                {errors.auditedBy && <p className="text-red-500 text-sm mt-1">{errors.auditedBy}</p>}
              </div>
            </div>
            
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Room Items Audit</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Before</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">After</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.audit.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.conditionBefore === 'good' ? 'bg-green-100 text-green-800' :
                            item.conditionBefore === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.conditionBefore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.conditionAfter}
                            onChange={(e) => handleAuditItemChange(index, 'conditionAfter', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {conditionOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleAuditItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-16 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            item.chargeAmount > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            ₹{item.chargeAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleAuditItemChange(index, 'notes', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add notes..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.audit.notes}
                  onChange={(e) => handleInputChange('audit', 'notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes..."
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Audit Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Total Items:</span> {formData.audit.items.length}</p>
                  <p><span className="font-medium">Damaged Items:</span> {formData.audit.items.filter(item => item.conditionAfter === 'damaged' || item.conditionAfter === 'broken').length}</p>
                  <p><span className="font-medium">Total Charges:</span> <span className="text-red-600 font-bold">₹{formData.audit.totalCharges}</span></p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirmation</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Ready to Submit</h3>
                  <p className="text-green-700">Please review all information before submitting.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Guest Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.guest.name}</p>
                  <p><span className="font-medium">Email:</span> {formData.guest.email}</p>
                  <p><span className="font-medium">Phone:</span> {formData.guest.phone}</p>
                  <p><span className="font-medium">People:</span> {formData.guest.numberOfPeople}</p>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Booking Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Room:</span> {rooms.find(r => r.id === formData.booking.roomId)?.name}</p>
                  <p><span className="font-medium">Check-in:</span> {formData.booking.checkInTime}</p>
                  {formData.booking.checkOutTime && (
                    <p><span className="font-medium">Check-out:</span> {formData.booking.checkOutTime}</p>
                  )}
                  <p><span className="font-medium">Status:</span> <span className="text-green-600">Confirmed</span></p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                Audit Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{formData.audit.items.length}</p>
                  <p className="text-sm text-gray-600">Items Audited</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {formData.audit.items.filter(item => item.conditionAfter === 'damaged' || item.conditionAfter === 'broken').length}
                  </p>
                  <p className="text-sm text-gray-600">Issues Found</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">₹{formData.audit.totalCharges}</p>
                  <p className="text-sm text-gray-600">Total Charges</p>
                </div>
              </div>
              
              {formData.audit.totalCharges > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Damage Charges</h4>
                  <div className="space-y-1 text-sm">
                    {formData.audit.items.filter(item => item.chargeAmount > 0).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-red-700">{item.productName} ({item.conditionAfter})</span>
                        <span className="font-medium text-red-700">₹{item.chargeAmount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">Important Note</p>
                  <p className="text-yellow-700">
                    By submitting this form, you confirm that all information is accurate and you agree to any charges listed above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guest Onboarding System</h1>
          <p className="text-gray-600 mt-2">Complete guest registration, booking, and room audit</p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 mx-4 h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          <div className="flex space-x-4">
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={submitForm}
                disabled={isSubmitting}
                className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Submit Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Debug Info (Remove in production) */}
        {/* <div className="mt-8 p-4 bg-gray-800 text-white rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium mb-2">Debug Information (Click to expand)</summary>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </details>
        </div> */}
      </div>
    </div>
  );
};

export default GuestOnboardingSystem;