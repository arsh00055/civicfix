// 'use client'

// import React, { useState, useEffect, useRef } from 'react'
// import { useRouter } from 'next/navigation'
// import MainLayout from '@/components/layout/MainLayout'
// import InputField from '@/components/UI/forms/InputField'
// import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
// import SecondaryButton from '@/components/UI/buttons/SecondaryButton'
// import { useAuth } from '@/features/auth/hooks/useAuth'
// import apiClient from '@/lib/services/api/client'


// const EditProfilePage: React.FC = () => {
//   const router = useRouter()
//   const { user: currentUser, refreshUser } = useAuth()
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     bio: '',
//     address: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     skills: [] as string[],
//     availability: [] as string[],
//     experienceLevel: '',
//     department: '',
//   })

//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
//   const [avatarFile, setAvatarFile] = useState<File | null>(null)
//   const [saving, setSaving] = useState(false)
//   const [uploadingAvatar, setUploadingAvatar] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState(false)


//   useEffect(() => {
//     refreshUser() // Force fresh fetch every time edit page opens
//   }, []) 
//   // Load user data
//   useEffect(() => {
//     if (currentUser) {
//       setFormData({
//         firstName: (currentUser as any).firstName || currentUser.name?.split(' ')[0] || '',
//         lastName: (currentUser as any).lastName || currentUser.name?.split(' ').slice(1).join(' ') || '',
//         email: currentUser.email || '',
//         phone: (currentUser as any).phone || '',
//         bio: (currentUser as any).bio || '',
//         address: (currentUser as any).address?.street || (currentUser as any).address || '',
//         city: (currentUser as any).city || (currentUser as any).address?.city || '',
//         state: (currentUser as any).state || (currentUser as any).address?.state || '',
//         zipCode: (currentUser as any).zipCode || (currentUser as any).address?.zipCode || '',
//         skills: (currentUser as any).skills || [],
//         availability: (currentUser as any).availability || [],
//         experienceLevel: (currentUser as any).experienceLevel || '',
//         department: (currentUser as any).department || '',
//       })
      
//       if (currentUser.avatar) {
//         const avatarUrl = currentUser.avatar.includes('?') 
//           ? `${currentUser.avatar}&t=${Date.now()}`
//           : `${currentUser.avatar}?t=${Date.now()}`
//         setAvatarPreview(avatarUrl)
//       }
//     }
//   }, [currentUser])

//   // Avatar file select
//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
//     if (!validTypes.includes(file.type)) {
//       setError('Only JPEG, PNG, WebP, GIF images allowed.')
//       return
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       setError('Image must be less than 5MB.')
//       return
//     }

//     setAvatarFile(file)
//     setAvatarPreview(URL.createObjectURL(file))
//     setError(null)
//   }

//   // Avatar upload
//   const uploadAvatar = async (): Promise<string | null> => {
//     if (!avatarFile || !currentUser) return null

//     setUploadingAvatar(true)
//     try {
//       const formDataUpload = new FormData()
//       formDataUpload.append('file', avatarFile)
//       formDataUpload.append('userId', currentUser.id)

//       const response = await apiClient.post('/api/upload/avatar', formDataUpload, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       })

//       if (response.data.success) {
//         return response.data.data.avatar
//       }
//       return null
//     } catch (err) {
//       console.error('Avatar upload error:', err)
//       setError('Failed to upload profile picture')
//       return null
//     } finally {
//       setUploadingAvatar(false)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!currentUser?.id) {
//       setError('User not authenticated')
//       return
//     }

//     setSaving(true)
//     setError(null)
//     setSuccess(false)

//     try {
//       let avatarUrl = null
//       if (avatarFile) {
//         avatarUrl = await uploadAvatar()
//       }

//       const updateData: any = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         name: `${formData.firstName} ${formData.lastName}`.trim(),
//         phone: formData.phone,
//         bio: formData.bio,
//         address: formData.address,
//         city: formData.city,
//         state: formData.state,
//         zipCode: formData.zipCode,
//       }

//       if (avatarUrl) updateData.avatar = avatarUrl

//       if (currentUser.role === 'volunteer') {
//         updateData.skills = formData.skills
//         updateData.availability = formData.availability
//         updateData.experienceLevel = formData.experienceLevel
//       }

//       if (currentUser.role === 'admin') {
//         updateData.department = formData.department
//       }

//       const response = await apiClient.put('/users/profile', updateData)

//       if (response.data.success) {
//         console.log('✅ Profile updated, refreshing user data...');
//         await refreshUser()
//         await new Promise(resolve => setTimeout(resolve, 800))
      
//         setSuccess(true)
      
      
//         router.push('/profile')
//       }else {
//         setError(response.data.message || 'Failed to update profile')
//       }
//     } catch (err: any) {
//       console.error('Profile update error:', err)
//       setError(err?.response?.data?.message || 'An error occurred while updating your profile')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (!currentUser) {
//     return (
//       <MainLayout role="citizen">
//         <div className="max-w-2xl mx-auto px-4 py-8 text-center">
//           <p className="text-gray-600">Please log in to edit your profile.</p>
//           <button onClick={() => router.push('/login')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
//             Log In
//           </button>
//         </div>
//       </MainLayout>
//     )
//   }

//   const isVolunteer = currentUser.role === 'volunteer'
//   const isAdmin = currentUser.role === 'admin'

//   return (
//     <MainLayout role={currentUser.role}>
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-3xl mx-auto">
//           <div className="mb-8">
//             <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
//             <p className="text-gray-600 mt-2">Update your personal information</p>
//           </div>

//           {success && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//               <p className="text-green-700 font-medium">Profile updated successfully! Redirecting...</p>
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//               <p className="text-red-700 text-sm">{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Profile Picture */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
//               <div className="flex flex-col sm:flex-row items-center gap-6">
//                 <div className="relative">
//                   <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-md">
//                     {avatarPreview ? (
//                       <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <span className="text-white text-2xl font-bold">
//                           {formData.firstName?.charAt(0).toUpperCase() || 'U'}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                   {uploadingAvatar && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
//                       <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex-1 text-center sm:text-left">
//                   <p className="text-sm text-gray-600 mb-3">Upload a profile picture (JPEG, PNG, WebP — max 5MB)</p>
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/jpeg,image/png,image/webp,image/gif"
//                     onChange={handleAvatarChange}
//                     className="hidden"
//                   />
//                   <div className="flex gap-2 justify-center sm:justify-start">
//                     <button
//                       type="button"
//                       onClick={() => fileInputRef.current?.click()}
//                       className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100"
//                     >
//                       Choose Image
//                     </button>
//                     {avatarFile && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setAvatarFile(null)
//                           setAvatarPreview(currentUser.avatar || null)
//                           if (fileInputRef.current) fileInputRef.current.value = ''
//                         }}
//                         className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Personal Information - First Name & Last Name */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* 👇 FIRST NAME FIELD */}
//                 <div>
//                   <label className="block text-sm font-medium text-black mb-1">
//                     First Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.firstName}
//                     onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
//                     required
//                     disabled={saving}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
//                     placeholder="Enter your first name"
//                   />
//                 </div>

//                 {/* 👇 LAST NAME FIELD */}
//                 <div>
//                   <label className="block text-sm font-medium text-black mb-1">
//                     Last Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.lastName}
//                     onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
//                     required
//                     disabled={saving}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
//                     placeholder="Enter your last name"
//                   />
//                 </div>

//                 {/* Email - Readonly */}
//                 <div>
//                   <label className="block text-sm font-medium text-black mb-1">
//                     Email Address <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     value={formData.email}
//                     disabled
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-black"
//                   />
//                 </div>

//                 {/* Phone Number */}
//                 <div>
//                   <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
//                   <input
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
//                     disabled={saving}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
//                     placeholder="+91 98765 43210"
//                   />
//                 </div>

//                 {/* City */}
//                 <div>
//                   <label className="block text-sm font-medium text-black mb-1">City</label>
//                   <input
//                     type="text"
//                     value={formData.city}
//                     onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
//                     disabled={saving}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
//                     placeholder="Your city"
//                   />
//                 </div>
//               </div>

//               {/* Bio */}
//               <div className="mt-6">
//                 <label className="block text-sm font-medium text-black mb-1">Bio</label>
//                 <textarea
//                   value={formData.bio}
//                   onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
//                   placeholder="Tell us about yourself..."
//                   rows={3}
//                   disabled={saving}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none text-black"
//                 />
//               </div>
//             </div>

//             {/* Volunteer Section */}
//             {isVolunteer && (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Details</h2>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
//                   <select
//                     value={formData.experienceLevel}
//                     onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
//                     disabled={saving}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   >
//                     <option value="">Select level</option>
//                     <option value="beginner">Beginner</option>
//                     <option value="intermediate">Intermediate</option>
//                     <option value="expert">Expert</option>
//                   </select>
//                 </div>
//               </div>
//             )}

//             {/* Admin Section */}
//             {isAdmin && (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Details</h2>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//                   <input
//                     type="text"
//                     value={formData.department}
//                     onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
//                     disabled={saving}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     placeholder="e.g., Administration, IT, HR"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Buttons */}
//             <div className="flex justify-between items-center pt-4 border-t border-gray-200">
//               <SecondaryButton type="button" onClick={() => router.back()} disabled={saving}>
//                 Cancel
//               </SecondaryButton>
//               <PrimaryButton type="submit" disabled={saving || uploadingAvatar} isLoading={saving}>
//                 {saving ? 'Saving...' : 'Save Changes'}
//               </PrimaryButton>
//             </div>
//           </form>
//         </div>
//       </div>
//     </MainLayout>
//   )
// }

// export default EditProfilePage


'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
import SecondaryButton from '@/components/UI/buttons/SecondaryButton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'

const EditProfilePage: React.FC = () => {
  const router = useRouter()
  const { user: currentUser, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    skills: [] as string[],
    availability: [] as string[],
    experienceLevel: '',
    department: '',
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ✅ Fresh data fetch on every mount
  useEffect(() => {
    refreshUser().catch(console.error)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Populate form whenever currentUser changes (after refreshUser completes)
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: (currentUser as any).firstName || currentUser.name?.split(' ')[0] || '',
        lastName: (currentUser as any).lastName || currentUser.name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email || '',
        phone: (currentUser as any).phone || '',
        bio: (currentUser as any).bio || '',
        address: (currentUser as any).address?.street || (currentUser as any).address || '',
        city: (currentUser as any).city || (currentUser as any).address?.city || '',
        state: (currentUser as any).state || (currentUser as any).address?.state || '',
        zipCode: (currentUser as any).zipCode || (currentUser as any).address?.zipCode || '',
        skills: (currentUser as any).skills || [],
        availability: (currentUser as any).availability || [],
        experienceLevel: (currentUser as any).experienceLevel || '',
        department: (currentUser as any).department || '',
      })

      if (currentUser.avatar) {
        const avatarUrl = currentUser.avatar.includes('?')
          ? `${currentUser.avatar}&t=${Date.now()}`
          : `${currentUser.avatar}?t=${Date.now()}`
        setAvatarPreview(avatarUrl)
      }
    }
  }, [currentUser])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, GIF images allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.')
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError(null)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !currentUser) return null

    setUploadingAvatar(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', avatarFile)
      formDataUpload.append('userId', currentUser.id)

      const response = await apiClient.post('/api/upload/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.success) return response.data.data.avatar
      return null
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('Failed to upload profile picture')
      return null
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.id) {
      setError('User not authenticated')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let avatarUrl = null
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      }

      if (avatarUrl) updateData.avatar = avatarUrl

      if (currentUser.role === 'volunteer') {
        updateData.skills = formData.skills
        updateData.availability = formData.availability
        updateData.experienceLevel = formData.experienceLevel
      }

      if (currentUser.role === 'admin') {
        updateData.department = formData.department
      }

      const response = await apiClient.put('/users/profile', updateData)

      if (response.data.success) {
        console.log('✅ Profile saved, refreshing user...')

        // ✅ Refresh user — updateAuthState inside will update all storage
        await refreshUser()

        setSuccess(true)

        // ✅ replace so back button nahi aata stale page par
        setTimeout(() => router.replace('/profile'), 800)
      } else {
        setError(response.data.message || 'Failed to update profile')
      }
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError(err?.response?.data?.message || 'An error occurred while updating your profile')
    } finally {
      setSaving(false)
    }
  }

  if (!currentUser) {
    return (
      <MainLayout role="citizen">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Please log in to edit your profile.</p>
          <button onClick={() => router.push('/login')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
            Log In
          </button>
        </div>
      </MainLayout>
    )
  }

  const isVolunteer = currentUser.role === 'volunteer'
  const isAdmin = currentUser.role === 'admin'

  return (
    <MainLayout role={currentUser.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-2">Update your personal information</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 font-medium">Profile updated successfully! Redirecting...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-md">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {formData.firstName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-3">Upload a profile picture (JPEG, PNG, WebP — max 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100"
                    >
                      Choose Image
                    </button>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview(currentUser.avatar || null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-black"
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none text-black"
                />
              </div>
            </div>

            {/* Volunteer Section */}
            {isVolunteer && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Administration, IT, HR"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <SecondaryButton type="button" onClick={() => router.back()} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={saving || uploadingAvatar} isLoading={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default EditProfilePage