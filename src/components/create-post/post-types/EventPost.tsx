"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface EventPostProps {
  onClose: () => void;
  onPostCreated?: () => void;
  initialData?: any;
}

const EventPost = ({ onClose, onPostCreated, initialData }: EventPostProps) => {
  const [title, setTitle] = useState(initialData?.eventTitle || "");
  const [description, setDescription] = useState(initialData?.desc || "");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState(initialData?.eventLocation || "");
  const [eventType, setEventType] = useState<"physical" | "virtual" | "hybrid">("physical");
  const [coverImage, setCoverImage] = useState<any>(
    initialData?.eventCoverImage ? { secure_url: initialData.eventCoverImage } : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter an event title");
      return;
    }

    if (!startDate || !startTime) {
      alert("Please set event start date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      const eventStartDate = new Date(`${startDate}T${startTime}`);
      const eventEndDate = endDate && endTime ? new Date(`${endDate}T${endTime}`) : null;

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desc: description,
          postType: "event",
          eventTitle: title,
          eventStartDate: eventStartDate.toISOString(),
          eventEndDate: eventEndDate?.toISOString() || null,
          eventLocation: location,
          eventType: eventType,
          eventCoverImage: coverImage?.secure_url || null,
          eventRSVPs: [],
        }),
      });

      if (response.ok) {
        onPostCreated?.();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Event creation failed:", response.status, errorData);
        throw new Error(errorData.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Cover Image (Optional)
        </label>
        {!coverImage ? (
          <CldUploadWidget
            uploadPreset="kamwale"
            options={{
              resourceType: "image",
              maxFileSize: 10000000,
              cloudName: "dhavbpm5k",
            }}
            onSuccess={(result) => {
              setCoverImage(result.info);
            }}
            onError={(error) => {
              console.error("Upload error:", error);
              alert("Upload failed. Please try again.");
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <Image src="/addevent.png" alt="Upload" width={32} height={32} />
                  <p className="text-gray-600 text-sm">Add event cover image</p>
                </div>
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <div className="relative">
            <Image
              src={coverImage.secure_url}
              alt="Cover"
              width={800}
              height={300}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setCoverImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Event Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title..."
          className="w-full px-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={100}
        />
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Type *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "physical", label: "Physical", icon: "📍" },
            { value: "virtual", label: "Virtual", icon: "💻" },
            { value: "hybrid", label: "Hybrid", icon: "🌐" },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setEventType(type.value as any)}
              className={`px-4 py-3 border-2 rounded-lg transition-colors ${
                eventType === type.value
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="font-semibold text-sm">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {eventType === "virtual" ? "Meeting Link" : "Location"} *
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={
            eventType === "virtual"
              ? "https://zoom.us/j/..."
              : "Enter venue or address"
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Time *
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Time (Optional)
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Event Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Description
        </label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe your event, what attendees can expect..."
          minHeight="150px"
          showToolbar={true}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !startDate || !startTime}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  );
};

export default EventPost;
