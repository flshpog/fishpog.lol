"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/Card";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import { useProfileStore } from "../store/profileStore";
import { useSettingsStore } from "@/store/settingsStore";

const FRUIT_OPTIONS: FilterOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Orange", value: "orange" },
  { label: "Pear", value: "pear" },
  { label: "Peach", value: "peach" },
  { label: "Cherry", value: "cherry" },
];

const HEMISPHERE_OPTIONS: FilterOption[] = [
  { label: "Northern", value: "northern" },
  { label: "Southern", value: "southern" },
];

export function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    characterName, setCharacterName,
    islandName, setIslandName,
    switchCode, setSwitchCode,
    creatorCode, setCreatorCode,
    profileImage, setProfileImage,
  } = useProfileStore();

  const hemisphere = useSettingsStore((s) => s.hemisphere);
  const setHemisphere = useSettingsStore((s) => s.setHemisphere);
  const nativeFruit = useSettingsStore((s) => s.nativeFruit);
  const setNativeFruit = useSettingsStore((s) => s.setNativeFruit);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text">Profile</h1>
        <p className="text-text-secondary mt-1">
          Manage your character and island details. All data is stored locally.
        </p>
      </div>

      {/* Profile Image + Name */}
      <Card>
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-bg-hover border-2 border-dashed border-border hover:border-primary-400 transition-colors overflow-hidden flex items-center justify-center"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-muted">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {profileImage && (
              <button
                onClick={() => setProfileImage(null)}
                className="text-xs text-text-muted hover:text-favorite mt-1 block mx-auto transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <InputField
              label="Character Name"
              value={characterName}
              onChange={setCharacterName}
              placeholder="Enter your character name"
            />
            <InputField
              label="Island Name"
              value={islandName}
              onChange={setIslandName}
              placeholder="Enter your island name"
            />
          </div>
        </div>
      </Card>

      {/* Game Settings */}
      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Game Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text block mb-2">Hemisphere</label>
            <FilterBar
              options={HEMISPHERE_OPTIONS}
              selected={hemisphere}
              onSelect={(v) => setHemisphere(v as "northern" | "southern")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text block mb-2">Native Fruit</label>
            <FilterBar
              options={FRUIT_OPTIONS}
              selected={nativeFruit}
              onSelect={setNativeFruit}
            />
          </div>
        </div>
      </Card>

      {/* Codes */}
      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Friend Codes</h2>
        <div className="space-y-3">
          <InputField
            label="Switch Friend Code"
            value={switchCode}
            onChange={setSwitchCode}
            placeholder="SW-XXXX-XXXX-XXXX"
          />
          <InputField
            label="Creator Code"
            value={creatorCode}
            onChange={setCreatorCode}
            placeholder="MA-XXXX-XXXX-XXXX"
          />
        </div>
      </Card>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-text block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-9 px-3 rounded-lg
          bg-bg border border-border
          text-sm text-text placeholder:text-text-muted
          focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400
          transition-colors
        "
      />
    </div>
  );
}
