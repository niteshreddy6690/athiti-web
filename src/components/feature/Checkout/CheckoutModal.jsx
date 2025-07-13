"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, CheckCircle, AlertCircle, X, User, Calendar } from 'lucide-react';
import Portal from '@/components/Portal';
import { API_URL } from '@/utils/constants';
const CheckoutModal = ({ isOpen, onClose, guestData, roomData, bookingData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({

    audit: {
      auditType: 'check-out',
      auditedBy: 'system',
      items: [],
      totalCharges: 0,
      notes: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomProducts, setRoomProducts] = useState([]);



  const steps = [
    { id: 1, title: 'Room Audit', icon: ClipboardList },
    { id: 2, title: 'Confirmation', icon: CheckCircle }
  ];

  const conditionOptions = ['good', 'fair', 'damaged', 'broken'];

  // Fetch room products when modal opens
  const fetchAllRoomProducts = useCallback(async function getAllTheRoomProducts() {
    if (roomData?._id) {
      try {
  
 const response= await fetch(`${API_URL}/room-product/room/${roomData._id}`)
      const data= await response.json()
     setRoomProducts(data)
      
        const initialAuditItems = data.map(product => ({
          roomProductId: product._id,
          productName: product?.productId?.name,
          conditionBefore: product.conditionBefore || "good",
          conditionAfter: product.conditionBefore || "good",
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

        
      } catch (error) {
        console.error('Error fetching room products:', error);
      }
    }
  }, [roomData?._id]);

  useEffect(() => {
    if (isOpen && roomData?._id) {
      fetchAllRoomProducts();
    }
  }, [isOpen, roomData?._id, fetchAllRoomProducts]);

  // Calculate total charges when audit items change
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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.audit.auditedBy?.trim()) newErrors.auditedBy = 'Auditor name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      audit: {
        ...prev.audit,
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

     console.log('Checkout Data:', {
        booking: bookingData,
        guest: guestData,
        room: roomData,
        audit: formData.audit
      });

  const submitCheckout = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
let allProductAitemAuditValues
let totalCharges
        if(roomData && formData?.audit){
       
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

         totalCharges= allProductAitemAudit
  .filter(result => result.status === 'fulfilled' && result.value?._id) 
  .reduce((acc,curr) => 
  {
    return acc=+curr
  },0); 
           allProductAitemAuditValues= allProductAitemAudit
  .filter(result => result.status === 'fulfilled') 
  .map(result => result.value); 
        }


         if( allProductAitemAuditValues){
        
        const auditDetails=await fetch(`${API_URL}/audit`,{
               method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
           body: JSON.stringify({
            bookingId:bookingData?._id,
            roomId:roomData?._id,
            guestId:guestData?._id,
            items:allProductAitemAuditValues,
            totalCharges:totalCharges||0,
            auditedBy:formData?.audit?.auditedBy,
            auditType:formData?.audit?.auditType,
            status:"completed",
            note:formData?.audit?.notes,
           })
        })


        if (!auditDetails.ok) {
          throw new Error('Failed to create audit details');
        }
          
           
        await fetch(`${API_URL}/guest/${guestData?._id}/checkout`,{
                      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },body: JSON.stringify({  roomId:roomData?._id,})

         })



        console.log("auditDetails",await auditDetails.json())
         }

      
      

      alert('Checkout completed successfully!');
      onClose();
      
      // Reset form
      setFormData({
        audit: { auditType: 'check-out', auditedBy: '', items: [], totalCharges: 0, notes: '' }
      });
      setCurrentStep(1);
      setErrors({});
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error completing checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Type
                </label>
                <select
                  value={formData.audit.auditType}
                  onChange={(e) => handleInputChange('auditType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
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
                  onChange={(e) => handleInputChange('auditedBy', e.target.value)}
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
                            disabled
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
                  onChange={(e) => handleInputChange('notes', e.target.value)}
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
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Ready to Checkout</h3>
                  <p className="text-green-700">Please review all information before completing checkout.</p>
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
                  <p><span className="font-medium">Name:</span> {guestData?.name || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {guestData?.email || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {guestData?.phone || 'N/A'}</p>
                  <p><span className="font-medium">People:</span> {guestData?.numberOfPeople || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Room & Booking Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Room:</span> {roomData?.roomNumber || 'N/A'}</p>
                  <p><span className="font-medium">Type:</span> {roomData?.roomType || 'N/A'}</p>
                  <p><span className="font-medium">Check-in:</span> {bookingData?.checkInTime || 'N/A'}</p>
                  <p><span className="font-medium">Check-out:</span> {bookingData?.checkOutTime || 'N/A'}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-orange-600">Checking Out</span></p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                Checkout Audit Summary
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Checkout Confirmation</p>
                  <p className="text-blue-700">
                    By completing this checkout, you confirm that the room audit is accurate and agree to any applicable charges.
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

  if (!isOpen) return null;

  return (
        <Portal>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Guest Checkout</h2>
            <p className="text-gray-600">Complete room audit and checkout process</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between max-w-md mx-auto">
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
                  <div className="ml-3">
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
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
                onClick={submitCheckout}
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
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Complete Checkout
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
};

export default CheckoutModal