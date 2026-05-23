import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

export default function Contact({ listing }) {
  const [Landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        if (!listing?.userRef) return;
        const res = await apiFetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        if (data.success === false) {
          console.log("could not fetch landlord data");
          return;
        }
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing?.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };
  return (
    <div>
      {Landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact<span className="font-semibold">{Landlord.username}</span>
          </p>
          <span className="font-semibold">{listing?.name?.toLowerCase()}</span>
          <textarea
            name="message"
            id="message"
            rows={2}
            value={message}
            onChange={onChange}
            placeholder="Enter your message here... "
            className="w-full border p-3 rounded-lg"
          ></textarea>

          <Link 
            to={`mailto:${Landlord.email}?Subject=Regarding ${listing.name}&body=${message}`}
            className="bg-slate-700 text-white text-center py-3 rounded-lg uppercase hover:opacity-95"
          >
            Send Message
          </Link>
        </div>
      )}
    </div>
  );
}
