import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/navigation";
import { FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking } from "react-icons/fa";
import Contact from "../components/Contact";

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [copied, setCopied] = useState(false); 
  const { currentUser } = useSelector((state) => state.user);
  const [contact, setContact] = useState(false);
  const params = useParams();
  useEffect(() => {
    const fetchListing = async () => {
      if (!params.listingId) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.listingId]);

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl text-red-700">
          Something went wrong!
        </p>
      )}
      {listing && !error && !loading && (
        <div>
          <Swiper modules={[Navigation]} navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className=" flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-bold mt-4">
              {listing.name} - ${" "}
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-US")
                : listing.regularPrice.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </p>

            <p className="flex items-center mt-6 gap-2 text-slate-600 my-2 text-sm">
              <FaMapMarkerAlt className="text-green-700" /> {listing?.address}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ${+listing.regularPrice - +listing.discountPrice} Discount
                </p>
              )}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              {listing.description}
            </p>
            <ul className=" text-green-900 font-semibold text-sm flex flex-wrap  flex-between items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-2 whitespace-nowrap  ">
                <FaBed className="inline-block text-lg" /> {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : ` ${listing.bedrooms} Bed`}
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap  ">
                <FaBath className="inline-block text-lg" /> {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : ` ${listing.bathrooms} Bath`}
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap  ">
                <FaParking className="inline-block text-lg" /> {listing.parking ? "Parking Spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap  ">
                <FaChair className="inline-block text-lg" /> {listing.furnished ? "Furnished" : "Not Furnished"}
              </li>
            </ul>
            {currentUser && listing.userRef === currentUser._id && !contact && (
              <button onClick={() => setContact(true)} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">Contact Landlord</button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
