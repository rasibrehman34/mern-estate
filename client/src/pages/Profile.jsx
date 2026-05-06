import { useSelector, useDispatch } from "react-redux"
import { useRef, useState } from "react"
import { updateUserSuccess, updateUserFailure,updateUserStart, signInFailure, signInSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess } from "../redux/user/userSlice"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../firebase"

export default function Profile() {
  const fileRef = useRef(null)
  const { currentUser, loading, error } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  // State for handling image upload loading and preview
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const [imageUploadLoadingSuccess, setImageUploadLoadingSuccess] = useState(false)
  const [imageUploadError, setImageUploadError] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [formData, setFormData] = useState({})
  const [updateSuccess, setUpdateSuccess] = useState(false )

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: show preview immediately
    setPreviewImage(URL.createObjectURL(file));

    try {
      setImageUploadLoading(true);
      setImageUploadError(false);
      setImageUploadLoadingSuccess(true);

      // 1. Delete old image from Cloudinary if public_id exists in currentUser
      if (currentUser.avatar_public_id) {
        await fetch('/api/user/delete-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',  // Add credentials for authentication
          body: JSON.stringify({ public_id: currentUser.avatar_public_id })
        });
      }

      // 2. Upload new image to Backend (Cloudinary)
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/user/upload-image', {
        method: 'POST',
        credentials: 'include',  // Add credentials for authentication
        body: formData,
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      // 3. Save new URL + public_id in Firebase Firestore
      const userId = currentUser._id || currentUser.uid;
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        avatar: data.imageUrl,
        avatar_public_id: data.public_id
      }, { merge: true });

      // 4. Update Redux state with new image url and public_id
      dispatch(updateUserSuccess({
        avatar: data.imageUrl,
        avatar_public_id: data.public_id
      }));

      setImageUploadLoading(false);
    } catch (error) {
      console.error(error);
      setImageUploadError(true);
      setImageUploadLoading(false);
      setImageUploadLoadingSuccess(false);
    }
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  // Add this to send cookies for authentication
        body: JSON.stringify(formData),  
        
      })
      const data = await res.json();
      console.log(data)
      if(data.success === false){
        dispatch(updateUserFailure(data.message))
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true)

    } catch (error) {
      dispatch(updateUserFailure(error.message))
    }
    
  }
 
  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value });
  }
  console.log(formData)
  
  const handleDeleteUser = async () => {
    try {
       dispatch(deleteUserStart());
       const res = await fetch(`/api/user/delete/${currentUser._id}`,{
         method: 'DELETE',
       });
       const data = await res.json();
       if(data.success === false){
        dispatch(deleteUserFailure(data.message));
        return;
       }
       dispatch(deleteUserSuccess(data))
      
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
      
    }
  }
  
  

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Profile
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/.*"
          hidden
          ref={fileRef}
          onChange={handleImageUpload} // Handle file selection
        />

        <img
          src={previewImage || currentUser.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"}
          alt="Profile"
          className={`h-24 w-24 rounded-full object-cover cursor-pointer self-center mt-2 ${imageUploadLoading ? 'opacity-50' : ''}`}
          onClick={() => fileRef.current.click()} />

        {/* Loading state indicator */}
        <p className='text-sm self-center'>
          {imageUploadError ? (
            <span className='text-red-700'>Error uploading image</span>
          ) : imageUploadLoading ? (
            <span className='text-slate-700'>Uploading...</span>
          ) : imageUploadLoadingSuccess ? (
            <span className='text-green-700'>Upload Successfully</span>
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
          className="border p-3 rounded-lg bg-white" />
        <input
          type="email"
          id="email"
          defaultValue={currentUser.email}
          placeholder="Email"
          onChange={handleChange}
          className="border p-3 rounded-lg bg-white" />
        <input
          type="password"
          id="password"
          placeholder="password"
          onChange={handleChange} 
          className="border p-3 rounded-lg bg-white" />

        <button disabled={loading}
         className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">{loading ? 'Loading...' :  'Update' }</button>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete account</span>
        <span className="text-red-700 cursor-pointer">Sign out</span>

      </div>
      <p className='text-red-600 mt-5'>{error ? error : ''}</p>
      <p className="text-green-700 mt-5">{updateSuccess?'User is update successfully!': ''}</p>
    </div>
  )
}
