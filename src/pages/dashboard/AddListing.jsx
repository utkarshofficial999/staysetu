import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION, ID } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeft, Upload, MapPin, IndianRupee, Home,
    CheckCircle2, AlertCircle, Save, X, Plus, Locate, Search
} from 'lucide-react';
import PropertyMap from '../../components/common/PropertyMap';

const AddListing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        latitude: '',
        longitude: '',
        type: 'PG',
        gender_preference: 'any',
        phone_number: '',
        whatsapp_number: '',
        amenities: [],
        images: [''] // Array of image URLs
    });

    const amenityOptions = ['WiFi', 'AC', 'Food', 'Parking', 'Laundry', 'Security', 'Gym', 'Attached Bath'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString()
        }));
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                handleLocationChange(latitude, longitude);

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        setFormData(prev => ({
                            ...prev,
                            location: data.display_name
                        }));
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError('Unable to retrieve your location. Please ensure location services are enabled.');
                console.error(err);
                setLoading(false);
            }
        );
    };

    const searchAddressOnMap = async () => {
        if (!formData.location || formData.location.trim().length < 5) {
            setError('Please enter a more specific address to search on the map.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const query = encodeURIComponent(formData.location);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                handleLocationChange(parseFloat(lat), parseFloat(lon));
            } else {
                setError('Could not find this address on the map. Please pin it manually.');
            }
        } catch (err) {
            setError('Error searching address. Please try pinning manually.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleImageUrlChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImageField = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!user) throw new Error('You must be logged in to add a listing');

            const imageUrls = formData.images.filter(url => url.trim());

            await databases.createDocument(DATABASE_ID, COLLECTION.listings, ID.unique(), {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                location: formData.location,
                latitude: formData.latitude,
                longitude: formData.longitude,
                type: formData.type,
                phoneNumber: formData.phone_number,
                whatsappNumber: formData.whatsapp_number,
                amenities: JSON.stringify(formData.amenities),
                images: JSON.stringify(imageUrls),
                ownerId: user.$id,
                status: 'pending',
                genderPreference: formData.gender_preference || 'any',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-slate-600 hover:text-plum-500 font-bold mb-8 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100">
                    <div className="p-8 md:p-12 border-b border-slate-50">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Add New Property</h1>
                        <p className="text-slate-500 font-medium tracking-tight">Provide detailed information about your stay to attract students.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3">
                                <AlertCircle className="text-red-500 shrink-0" size={20} />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start space-x-3 font-bold text-green-600">
                                <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                                <p>Listing submitted successfully! Waiting for admin approval.</p>
                            </div>
                        )}

                        {/* Basic Info */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-plum-100 text-plum-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Property Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g. Modern Boys PG near Knowledge Park"
                                        className="input-field"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Property Type</label>
                                    <select
                                        name="type"
                                        className="input-field cursor-pointer"
                                        value={formData.type}
                                        onChange={handleChange}
                                    >
                                        <option value="PG">PG (Paying Guest)</option>
                                        <option value="Flat">Flat / Apartment</option>
                                        <option value="Hostel">Hostel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Gender Preference</label>
                                    <select
                                        name="gender_preference"
                                        className="input-field cursor-pointer"
                                        value={formData.gender_preference}
                                        onChange={handleChange}
                                    >
                                        <option value="any">Any (Co-living)</option>
                                        <option value="boys">Boys Only</option>
                                        <option value="girls">Girls Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Monthly Rent (₹)</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            placeholder="8500"
                                            className="input-field pl-10"
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex gap-2 mb-6">
                                        <div className="relative flex-1">
                                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                name="location"
                                                required
                                                placeholder="e.g. Plot 12, Alpha 2, Greater Noida"
                                                className="input-field pl-10"
                                                value={formData.location}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={searchAddressOnMap}
                                            className="px-6 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shrink-0"
                                        >
                                            <Search size={14} />
                                            <span className="hidden sm:inline">Find on Map</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Pin Precise Location on Map</label>
                                        <button
                                            type="button"
                                            onClick={useCurrentLocation}
                                            className="flex items-center gap-1.5 text-xs font-black text-plum-600 hover:text-plum-700 transition-colors uppercase tracking-widest"
                                        >
                                            <Locate size={14} />
                                            Use Live Location
                                        </button>
                                    </div>
                                    <PropertyMap
                                        isPicker={true}
                                        position={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : null}
                                        onLocationChange={handleLocationChange}
                                    />
                                    {(formData.latitude && formData.longitude) ? (
                                        <p className="mt-2 text-[11px] text-emerald-600 font-bold flex items-center">
                                            <Locate size={10} className="mr-1" /> Coordinates pinned: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-[11px] text-amber-600 font-bold flex items-center">
                                            <AlertCircle size={10} className="mr-1" /> Please click on the map to pin the exact property location
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Description</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        placeholder="Tell students about the rooms, food, environment etc..."
                                        className="input-field resize-none"
                                        value={formData.description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-plum-100 text-plum-600 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                                Amenities & Facilities
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {amenityOptions.map(amenity => (
                                    <button
                                        key={amenity}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all font-bold text-sm ${formData.amenities.includes(amenity)
                                            ? 'border-plum-500 bg-plum-50 text-plum-700'
                                            : 'border-slate-50 text-slate-500 hover:border-slate-100'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Photos */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-plum-100 text-plum-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                                Property Photos (URLs)
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Paste image URLs from the web (Unsplash, etc.)</p>
                            <div className="space-y-4">
                                {formData.images.map((url, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="url"
                                            placeholder="https://example.com/image.jpg"
                                            className="input-field"
                                            value={url}
                                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                        />
                                        {formData.images.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeImageField(index)}
                                                className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addImageField}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 flex items-center justify-center space-x-2 hover:border-plum-300 hover:text-plum-500 transition-all font-bold"
                                >
                                    <Plus size={20} />
                                    <span>Add Another Image URL</span>
                                </button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-plum-100 text-plum-600 rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        required
                                        placeholder="+91 XXXXX XXXXX"
                                        className="input-field"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        name="whatsapp_number"
                                        required
                                        placeholder="+91 XXXXX XXXXX"
                                        className="input-field"
                                        value={formData.whatsapp_number}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-primary py-5 rounded-2xl text-lg flex items-center justify-center space-x-3 shadow-premium"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Submit Listing for Approval</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn-secondary py-5 px-10 rounded-2xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddListing;
