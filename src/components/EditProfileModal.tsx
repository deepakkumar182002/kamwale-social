"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

interface Link {
  title: string;
  url: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userData: {
    username: string;
    name: string | null;
    surname: string | null;
    description: string | null;
    profession: string | null;
    occupation: string | null;
    website: string | null;
    links: Link[] | null;
    avatar: string | null;
    cover: string | null;
    city: string | null;
    school: string | null;
    work: string | null;
  };
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
  userData,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: userData.name || "",
    surname: userData.surname || "",
    description: userData.description || "",
    profession: userData.profession || "",
    occupation: userData.occupation || "",
    website: userData.website || "",
    city: userData.city || "",
    school: userData.school || "",
    work: userData.work || "",
    avatar: userData.avatar || "",
    cover: userData.cover || "",
  });

  const [links, setLinks] = useState<Link[]>(userData.links || []);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: userData.name || "",
        surname: userData.surname || "",
        description: userData.description || "",
        profession: userData.profession || "",
        occupation: userData.occupation || "",
        website: userData.website || "",
        city: userData.city || "",
        school: userData.school || "",
        work: userData.work || "",
        avatar: userData.avatar || "",
        cover: userData.cover || "",
      });
      setLinks(userData.links || []);
    }
  }, [isOpen, userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      setLinks([...links, newLink]);
      setNewLink({ title: "", url: "" });
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          links,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X size={24} className="dark:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <Image
                src={formData.avatar || "/noAvatar.png"}
                alt="Avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
              <CldUploadWidget
                uploadPreset="kamwale"
                onSuccess={(result: any) =>
                  setFormData({ ...formData, avatar: result.info.secure_url })
                }
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                  >
                    Change Photo
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>

          {/* Cover Photo */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Cover Photo
            </label>
            <div className="space-y-2">
              {formData.cover && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <Image
                    src={formData.cover}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CldUploadWidget
                uploadPreset="kamwale"
                onSuccess={(result: any) =>
                  setFormData({ ...formData, cover: result.info.secure_url })
                }
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                  >
                    {formData.cover ? "Change Cover" : "Add Cover Photo"}
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>

          {/* Username (Read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={userData.username}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
            />
          </div>

          {/* Surname */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
            />
          </div>

          {/* Profession */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer, Designer"
            />
          </div>

          {/* Occupation */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Freelancer, Full-time"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Bio/Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Write a short bio about yourself"
            />
          </div>

          {/* Website */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Links Section */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Additional Links
            </label>
            
            {/* Existing Links */}
            <div className="space-y-2 mb-3">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <LinkIcon size={18} className="text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold dark:text-white">
                      {link.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {link.url}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Link */}
            <div className="space-y-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <input
                type="text"
                value={newLink.title}
                onChange={(e) =>
                  setNewLink({ ...newLink, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Link title (e.g., GitHub, LinkedIn)"
              />
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Link
              </button>
            </div>
          </div>

          {/* City */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your city"
            />
          </div>

          {/* School */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              School/University
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your school or university"
            />
          </div>

          {/* Work */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Work/Company
            </label>
            <input
              type="text"
              name="work"
              value={formData.work}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Company you work at"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
