import React from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useStore } from "@/RootStoreProvider";

interface CheckoutPageProps {}

const CheckoutPage = (props: CheckoutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { generalStore } = useStore();
  const { isMobileView } = generalStore;

  // Add logic to handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    // Add logic to create a payment method and handle the payment
  };

  return (
    <div
      className="text-whitebg h-full md:min-h-[77.5dvh] md:max-h-[77.5dvh] overflow-y-auto"
      style={{
        textShadow: "10px 10px 10px rgba(0,0,0,1)",
        height: "calc(100dvh - 50px)",
        paddingBottom: isMobileView ? "150px" : "",
      }}
    >
      {/* Header */}
      <div className="relative md:p-4 px-4">
        <h1 className="text-3xl font-bold">
          Your Personalized Zone 2 Training Guide
        </h1>
      </div>

      {/* Content */}
      <div className="px-4 mb-4">
        <div className="flex flex-col mb-4">
          <span className="text-1xl font-semibold mt-4">One Time Purchase</span>
          <div className="flex items-start mt-2">
            <span className="text-3xl font-bold">$6.99</span>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">
          Includes:
        </h2>
        <ul className="list-disc list-inside">
          <li className="md:mb-2 mb-0 md:text-lg">Expected Benefits</li>
          <li className="md:mb-2 mb-0 md:text-lg">
            Effective Exercise Doses
            <ul className="list-disc list-inside md:mt-2 pl-6 border-dashed border-gray-300">
              <li className="md:mb-2 mb-0 text-sm">Duration</li>
              <li className="md:mb-2 mb-0 text-sm">Frequency</li>
            </ul>
          </li>
          <li className="md:mb-2 mb-0 md:text-lg">
            Methods For Determining Zone 2 Intensity
          </li>
          <li className="md:mb-2 mb-0 md:text-lg text-wrap">
            What To Think About During Zone 2 Training
          </li>
          <li className="md:mb-2 mb-0 md:text-lg">
            The Importance of Consistency
          </li>
          <li className="md:mb-2 mb-0 md:text-lg">Incorporating Flexibility</li>
          <li className="md:mb-2 mb-0 md:text-lg">
            Realistic Goals & Expectations
            <ul className="list-disc list-inside md:mt-2 pl-6  border-dashed border-gray-300">
              <li className="md:mb-2 mb-0 text-sm">Assessing Progress</li>
              <li className="md:mb-2 mb-0 text-sm">
                When To Adjust Duration & Frequency
              </li>
            </ul>
          </li>
          <li className="md:text-lg">Recovery & Preventing Overtraining </li>
        </ul>
      </div>
    </div>
  );
};

export default CheckoutPage;
