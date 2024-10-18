import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Booking.css'; // Import the CSS file
import Sidebar from './Sidebar';
import { useAuth0 } from '@auth0/auth0-react';

const Booking = () => {
  const { isAuthenticated, user, logout } = useAuth0();
  const [date, setDate] = useState(new Date());
  const [activeView, setActiveView] = useState('dashboard');
  const [weeklySlots, setWeeklySlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [errors, setErrors] = useState({});

  const sidebarItems = [
    { label: 'Dashboard', section: 'dashboard' },
    { label: 'Active Classes', section: 'activeClasses' },
    { label: 'History', section: 'history' },
    { label: 'Contact Us', section: 'contactUs' },
    { label: 'Terms & Conditions', section: 'termsConditions' },
  ];

  useEffect(() => {
    console.log('Auth0 isAuthenticated:', isAuthenticated);
    console.log('Auth0 user:', user);
    console.log('Environment Variables:', {
      REACT_APP_AUTH0_DOMAIN: process.env.REACT_APP_AUTH0_DOMAIN,
      REACT_APP_AUTH0_CLIENT_ID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      RAZORPAY_SECRET: process.env.RAZORPAY_SECRET,
    });

    if (isAuthenticated) {
      fetchWeeklySlots();
    }
  }, [date, isAuthenticated, user]);

  const API_URL = process.env.REACT_APP_API_URL || 'https://server.mydancehall.com';

  const fetchWeeklySlots = async () => {
    try {
      const response = await fetch(`${API_URL}/api/slots`); //changed from http://localhost:3001/api/slots to https://server.mydancehall.com/api/slots
      const allSlots = await response.json();
      console.log('Fetched slots:', allSlots); // Log fetched slots

      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      console.log('Start of week:', startOfWeek);
      console.log('End of week:', endOfWeek);

      const slotsByDay = {};
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const dayString = currentDay.toISOString().split('T')[0];
        slotsByDay[dayString] = allSlots.filter(slot => {
          const slotDate = new Date(slot.dateTime);
          if (isNaN(slotDate)) {
            console.error('Invalid date value:', slot.dateTime);
            return false;
          }
          const slotDateString = slotDate.toISOString().split('T')[0];
          return slotDateString === dayString;
        });
      }
      console.log('Processed weekly slots:', slotsByDay); // Log processed weekly slots
      setWeeklySlots(slotsByDay);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setPaymentAmount(slot.paymentAmount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');  // Debug: Check if this logs
    if (!selectedSlot) {
      setErrors({ form: 'Please select a class slot' });
      return;
    }

    try {
      console.log('Form validation passed');  // Debug: Check if validation passes
      const response = await fetch(`${API_URL}/create-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot._id,
          studentName: name,
          studentEmail: email,
          studentPhone: phone,
          paymentAmount: parseInt(paymentAmount),
          currency: selectedSlot.currency,
        }),
      });

      console.log('Booking request sent');  // Debug: Ensure the request was sent

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log('Booking response:', data);  // Debug: Log the response

      console.log('Booking successful, initializing Razorpay'); // Ensure this log appears
      const options = {
        amount: data.amount,
        currency: data.currency,
        name: 'Class Booking',
        description: 'Payment for class booking',
        order_id: data.orderId,
        handler: (response) => {
          console.log('Payment successful:', response);
          // Handle payment success
        },
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#3399cc',
        },
      };

      console.log('Razorpay options:', options); // Log Razorpay options

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        console.error('Payment failed details:', response.error.metadata);
        setErrors({ form: `Payment failed: ${response.error.description}` });
      });
      console.log('Before opening Razorpay popup');
      rzp.open();
      console.log('After opening Razorpay popup');
    } catch (err) {
      console.error('Error creating booking:', err);
      setErrors({ form: `Failed to create booking: ${err.message}` });
    }
  };

  const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getFormattedDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="booking-container">
      {/* Sidebar */}
      <div className="booking-container">
      <Sidebar items={sidebarItems} setActiveSection={setActiveView} />
      <div className="content">
        {/* Render content based on activeView */}
      </div>
    </div>

      {/* Main Content Area */}
      <div className="content">
        {activeView === 'dashboard' && (
          <div>
            <h1>Dashboard</h1>
            <div className="dashboard-content">
              {/* Calendar */}
              <div className="calendar-section">
                <h2>Select a Date</h2>
                <Calendar onChange={handleDateChange} value={date} />
              </div>

              {/* Available Classes */}
              <div className="available-classes">
                <h2>Available Classes</h2>
                <div className="class-list">
                  <div className="class-list-header">
                    {Object.keys(weeklySlots).map((day) => (
                      <div key={day} className="class-list-day">
                        <h3>{getDayOfWeek(new Date(day))}, {day}</h3>
                      </div>
                    ))}
                  </div>
                  <div className="class-list-body">
                    {Object.keys(weeklySlots).map((day) => (
                      <div key={day} className="class-list-day">
                        {weeklySlots[day].length > 0 ? (
                          <ul>
                            {weeklySlots[day].map((slot) => (
                              <li key={slot._id}>
                                <button
                                  className={selectedSlot && selectedSlot._id === slot._id ? 'selected' : ''}
                                  onClick={() => handleSlotSelect(slot)}
                                >
                                  {new Date(slot.dateTime).toLocaleTimeString()}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No available slots for this day.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="payment-form">
              <h2>Payment Form</h2>
              <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Phone:</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <label>Payment Amount:</label>
                <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
                <button type="submit">Pay</button>
                {errors.form && <p>{errors.form}</p>}
              </form>
            </div>
          </div>
        )}

        {activeView === 'activeClasses' && (
          <div>
            <h1>Active Classes</h1>
            {/* Logic to show active classes */}
          </div>
        )}

        {activeView === 'history' && (
          <div>
            <h1>History</h1>
            {/* Logic to show booking history */}
          </div>
        )}

        {activeView === 'contactUs' && (
          <div>
            <h1>Contact Us</h1>
            <p>Phone: +91 9611 712882</p>
            <p>Address: Sanathana natyalaya, SriDevi, College Rd, Taripady, Lalbagh Dakshina Kannada KARNATAKA 575003</p>
          </div>
        )}

        {activeView === 'termsConditions' && (
          <div>
            <h1>Terms & Conditions</h1>
            <p>
              For the purpose of these Terms and Conditions, The term "we", "us", "our" used anywhere on this page shall mean SHUBHAMANI CHANDRASHEKAR SHETTY, whose registered/operational office is Sanathana natyalaya, SriDevi, College Rd, Taripady, Lalbagh Dakshina Kannada KARNATAKA 575003 . "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
              Your use of the website and/or purchase from us are governed by following Terms and Conditions:
              The content of the pages of this website is subject to change without notice.
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
              Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
              Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
              All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
              Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
              From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.
              You may not create a link to our website from another website or document without SHUBHAMANI CHANDRASHEKAR SHETTY's prior written consent.
              Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.
              We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
            </p>
            <h2>Privacy Policy</h2>
            <p>
              We are committed to protecting your privacy. Authorized employees within the company on a need to know basis only use any information collected from individual customers. We constantly review our systems and data to ensure the best possible service to our customers. We will investigate any unauthorized actions against computer systems and data with a view to prosecuting and/or taking civil proceedings to recover damages against those responsible.
              We are committed to protecting your privacy. Authorized employees within the company on a need to know basis only use any information collected from individual customers. We constantly review our systems and data to ensure the best possible service to our customers. We will investigate any unauthorized actions against computer systems and data with a view to prosecuting and/or taking civil proceedings to recover damages against those responsible.
            </p>
            <h2>Refund & Cancellation Policy</h2>
            <p>
              SHUBHAMANI CHANDRASHEKAR SHETTY believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
              Cancellations will be considered only if the request is made within 2-3 days of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
              SHUBHAMANI CHANDRASHEKAR SHETTY does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
              In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 2-3 days of receipt of the products.
              In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 2-3 days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
              In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
              In case of any Refunds approved by the SHUBHAMANI CHANDRASHEKAR SHETTY, it'll take 3-4 days for the refund to be processed to the end customer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;