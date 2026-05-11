import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom'
import { useRef, useState } from "react";
import {
  updateUserSuccess,
  updateUserFailure,
  updateUserStart,
  signInFailure,
  signInSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signoutUserStart,
  signoutUserFailure,
  signoutUserSuccess,
} from "../redux/user/userSlice";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // State for handling image upload loading and preview
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadLoadingSuccess, setImageUploadLoadingSuccess] =
    useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  // Store the selected file without uploading immediately
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately but don't upload yet
    setPreviewImage(URL.createObjectURL(file));
    setSelectedFile(file);
    setImageUploadLoadingSuccess(false);
    setImageUploadError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      setImageUploadError(false);

      let updatedData = { ...formData };

      // If a new image was selected, upload it now
      if (selectedFile) {
        setImageUploadLoading(true);

        // 1. Delete old image from Cloudinary if public_id exists in currentUser
        if (currentUser.avatar_public_id) {
          await fetch("/api/user/delete-image", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ public_id: currentUser.avatar_public_id }),
          });
        }

        // 2. Upload new image to Backend (Cloudinary)
        const imageFormData = new FormData();
        imageFormData.append("image", selectedFile);

        const imgRes = await fetch("/api/user/upload-image", {
          method: "POST",
          credentials: "include",
          body: imageFormData,
        });
        const imgData = await imgRes.json();

        if (!imgData.success) {
          setImageUploadError(true);
          setImageUploadLoading(false);
          dispatch(updateUserFailure("Image upload failed"));
          return;
        }

        // Add avatar data to the update payload
        updatedData.avatar = imgData.imageUrl;
        updatedData.avatar_public_id = imgData.public_id;

        setImageUploadLoading(false);
        setImageUploadLoadingSuccess(true);
      }
      console.log(updatedData, 'updatedata===>>>>')
      // 3. Send all data (input fields + avatar) to the update API
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      // 4. Save to Firebase Firestore
      const userId = currentUser._id || currentUser.uid;
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          ...(updatedData.username && { username: updatedData.username }),
          ...(updatedData.email && { email: updatedData.email }),
          ...(updatedData.avatar && { avatar: updatedData.avatar }),
          ...(updatedData.avatar_public_id && { avatar_public_id: updatedData.avatar_public_id }),
        },
        { merge: true },
      );

      // 5. Update Redux state
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setSelectedFile(null);
    } catch (error) {
      console.error(error, 'error===>>>>>');
      setImageUploadLoading(false);
      dispatch(updateUserFailure(error.message));
    }
  };
  console.log(loading)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  console.log(formData);

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignoutUser = async () => {

    try {
      dispatch(signoutUserStart());
      const res = await fetch("/api/auth/signout")
      const data = await res.json();
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }

      dispatch(signoutUserSuccess(data));
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/.*"
          hidden
          ref={fileRef}
          onChange={handleImageSelect}
        />

        <img
          src={
            previewImage ||
            currentUser.avatar ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
          }
          alt="Profile"
          className={`h-24 w-24 rounded-full object-cover cursor-pointer self-center mt-2 ${imageUploadLoading ? "opacity-50" : ""}`}
          onClick={() => fileRef.current.click()}
        />

        {/* Loading state indicator */}
        <p className="text-sm self-center">
          {imageUploadError ? (
            <span className="text-red-700">Error uploading image</span>
          ) : imageUploadLoading ? (
            <span className="text-slate-700">Uploading...</span>
          ) : imageUploadLoadingSuccess ? (
            <span className="text-green-700">Upload Successfully</span>
          ) : selectedFile ? (
            <span className="text-slate-700">Image selected — click Update to save</span>
          ) : (
            " "
          )}
        </p>

        <input
          type="text"
          id="username"
          defaultValue={currentUser.username}
          placeholder="username"
          onChange={handleChange}
          className="border p-3 rounded-lg bg-white"
        />
        <input
          type="email"
          id="email"
          defaultValue={currentUser.email}
          placeholder="Email"
          onChange={handleChange}
          className="border p-3 rounded-lg bg-white"
        />
        <input
          type="password"
          id="password"
          placeholder="password"
          onChange={handleChange}
          className="border p-3 rounded-lg bg-white"
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>

        <Link className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95" to={"/create-listing"}>
          Create listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span
          onClick={handleSignoutUser}
          className="text-red-700 cursor-pointer"
        >
          Sign out
        </span>
      </div>
      <p className="text-red-600 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is update successfully!" : ""}
      </p>
    </div>
  );
}
