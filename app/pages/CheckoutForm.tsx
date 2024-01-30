import React from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AiOutlineArrowLeft } from "react-icons/ai";

interface CheckoutPageProps {}

const CheckoutPage = (props: CheckoutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();

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
    <div className="md:min-h-[77.5dvh] md:max-h-[77.5dvh] min-h-[72.5dvh] max-h-[72.5dvh]">
      {/* Header */}
      <div className="relative md:p-4 px-4">
        <h1 className="text-3xl font-bold text-title">
          Your Personalised Zone 2 Training Guide
        </h1>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto px-4 pt-2 text-gray-700"
        style={{ minHeight: "65dvh", maxHeight: "65dvh" }}
      >
        <div className="text-black flex flex-col mb-4">
          <span className="text-1xl font-semibold">One Time Purchase</span>
          <div className="flex items-start mt-2">
            <span className="text-3xl font-bold">$10.00</span>
          </div>
        </div>
        <h2
          className="text-xl font-bold text-title2"
          style={{ marginBottom: "1rem" }}
        >
          Includes:
        </h2>
        <ul className="list-disc list-inside">
          <li className="md:mb-2 mb-0 md:text-lg">Expected Benefits</li>
          <li className="md:mb-2 mb-0 md:text-lg">
            Effective Exercise Doses
            <ul className="list-disc list-inside md:mt-2 pl-6 border-dashed border-gray-300 text-gray-700">
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
            <ul className="list-disc list-inside md:mt-2 pl-6  border-dashed border-gray-300 text-gray-700">
              <li className="md:mb-2 mb-0 text-sm">Assessing Progress</li>
              <li className="md:mb-2 mb-0 text-sm">
                When To Adjust Duration & Frequency
              </li>
            </ul>
          </li>
          <li className="mb-8 md:text-lg">
            Recovery & Preventing Overtraining{" "}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CheckoutPage;
