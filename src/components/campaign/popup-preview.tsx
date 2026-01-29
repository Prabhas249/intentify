"use client";

import { X, MessageCircle } from "lucide-react";

interface PopupContent {
  headline: string;
  subheadline: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  ctaType: "link" | "whatsapp" | "email" | "close";
  whatsappNumber: string;
  whatsappMessage: string;
  imageUrl: string;
  showEmailField: boolean;
  showPhoneField: boolean;
  emailPlaceholder: string;
  phonePlaceholder: string;
  successMessage: string;
  styles: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderRadius: string;
  };
}

interface PopupPreviewProps {
  content: PopupContent;
  popupType: string;
  device: "desktop" | "mobile";
}

export function PopupPreview({ content, popupType, device }: PopupPreviewProps) {
  const { styles } = content;
  const radius = `${styles.borderRadius}px`;

  // Calculate contrasting text color for button
  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const buttonTextColor = getContrastColor(styles.accentColor);

  // Preview container dimensions based on device
  const containerClass =
    device === "mobile"
      ? "w-[320px] h-[568px] mx-auto"
      : "w-full h-[400px]";

  // Simulated website background
  const renderWebsiteBackground = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
      {/* Fake nav */}
      <div className="h-12 bg-white border-b flex items-center px-4">
        <div className="w-24 h-4 bg-slate-200 rounded"></div>
        <div className="ml-auto flex gap-3">
          <div className="w-16 h-3 bg-slate-200 rounded"></div>
          <div className="w-16 h-3 bg-slate-200 rounded"></div>
          <div className="w-16 h-3 bg-slate-200 rounded"></div>
        </div>
      </div>
      {/* Fake content */}
      <div className="p-6">
        <div className="w-48 h-6 bg-slate-200 rounded mb-4"></div>
        <div className="w-full h-3 bg-slate-200 rounded mb-2"></div>
        <div className="w-3/4 h-3 bg-slate-200 rounded mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="w-full h-20 bg-slate-100 rounded mb-2"></div>
              <div className="w-20 h-3 bg-slate-200 rounded mb-1"></div>
              <div className="w-12 h-3 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPopup = () => {
    const popupStyle = {
      backgroundColor: styles.backgroundColor,
      color: styles.textColor,
      borderRadius: radius,
    };

    const inputStyle = {
      backgroundColor: `${styles.textColor}10`,
      color: styles.textColor,
      borderColor: `${styles.textColor}30`,
    };

    const buttonStyle = {
      backgroundColor: styles.accentColor,
      color: buttonTextColor,
    };

    // Modal popup
    if (popupType === "MODAL" || popupType === "FULL_SCREEN") {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50"></div>
          <div
            className={`relative z-10 shadow-2xl ${
              popupType === "FULL_SCREEN"
                ? "w-full h-full rounded-none"
                : "max-w-sm w-full mx-4"
            }`}
            style={popupStyle}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors"
              style={{ color: styles.textColor }}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {content.imageUrl && (
                <img
                  src={content.imageUrl}
                  alt=""
                  className="w-full h-32 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              <h2 className="text-xl font-bold mb-1">{content.headline}</h2>
              <p className="text-base opacity-80 mb-2">{content.subheadline}</p>
              {content.body && (
                <p className="text-sm opacity-60 mb-4">{content.body}</p>
              )}

              {/* Form fields */}
              <div className="space-y-2 mb-4">
                {content.showEmailField && (
                  <input
                    type="text"
                    placeholder={content.emailPlaceholder}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    style={inputStyle}
                    readOnly
                  />
                )}
                {content.showPhoneField && (
                  <input
                    type="text"
                    placeholder={content.phonePlaceholder}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    style={inputStyle}
                    readOnly
                  />
                )}
              </div>

              {/* CTA Button */}
              <button
                className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                style={buttonStyle}
              >
                {content.ctaType === "whatsapp" && (
                  <MessageCircle className="h-4 w-4" />
                )}
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Slide-in popup
    if (popupType === "SLIDE_IN") {
      return (
        <div
          className="absolute bottom-4 right-4 w-72 shadow-2xl"
          style={popupStyle}
        >
          <button
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
            style={{ color: styles.textColor }}
          >
            <X className="h-3 w-3" />
          </button>

          <div className="p-4">
            <h3 className="text-base font-bold mb-1">{content.headline}</h3>
            <p className="text-sm opacity-80 mb-3">{content.subheadline}</p>

            {content.showEmailField && (
              <input
                type="text"
                placeholder={content.emailPlaceholder}
                className="w-full px-3 py-2 rounded-md border text-xs mb-2"
                style={inputStyle}
                readOnly
              />
            )}

            <button
              className="w-full py-2 rounded-lg font-medium text-sm"
              style={buttonStyle}
            >
              {content.ctaText}
            </button>
          </div>
        </div>
      );
    }

    // Banner popup
    if (popupType === "BANNER") {
      return (
        <div className="absolute top-12 left-0 right-0" style={popupStyle}>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex-1">
              <span className="font-medium text-sm">{content.headline}</span>
              <span className="mx-2 opacity-60">-</span>
              <span className="text-sm opacity-80">{content.subheadline}</span>
            </div>
            <div className="flex items-center gap-2">
              {content.showEmailField && (
                <input
                  type="text"
                  placeholder={content.emailPlaceholder}
                  className="px-2 py-1 rounded border text-xs w-32"
                  style={inputStyle}
                  readOnly
                />
              )}
              <button
                className="px-3 py-1 rounded text-xs font-medium"
                style={buttonStyle}
              >
                {content.ctaText}
              </button>
              <button
                className="p-1 hover:bg-black/10 rounded"
                style={{ color: styles.textColor }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Floating button
    if (popupType === "FLOATING") {
      return (
        <div
          className="absolute bottom-4 right-4 rounded-full shadow-xl cursor-pointer"
          style={{ backgroundColor: styles.accentColor }}
        >
          <div className="px-4 py-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" style={{ color: buttonTextColor }} />
            <span className="font-medium text-sm" style={{ color: buttonTextColor }}>
              {content.ctaText}
            </span>
          </div>
        </div>
      );
    }

    // Bottom sheet (mobile-first)
    if (popupType === "BOTTOM_SHEET") {
      return (
        <div className="absolute inset-0 flex items-end">
          <div className="absolute inset-0 bg-black/50"></div>
          <div
            className="relative z-10 w-full rounded-t-2xl shadow-2xl"
            style={popupStyle}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full opacity-30"
                style={{ backgroundColor: styles.textColor }}
              />
            </div>

            <div className="px-6 pb-6">
              <h2 className="text-lg font-bold mb-1">{content.headline}</h2>
              <p className="text-sm opacity-80 mb-4">{content.subheadline}</p>

              <div className="space-y-2 mb-4">
                {content.showEmailField && (
                  <input
                    type="text"
                    placeholder={content.emailPlaceholder}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    style={inputStyle}
                    readOnly
                  />
                )}
                {content.showPhoneField && (
                  <input
                    type="text"
                    placeholder={content.phonePlaceholder}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    style={inputStyle}
                    readOnly
                  />
                )}
              </div>

              <button
                className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                style={buttonStyle}
              >
                {content.ctaType === "whatsapp" && (
                  <MessageCircle className="h-4 w-4" />
                )}
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden border shadow-inner ${containerClass}`}
    >
      {renderWebsiteBackground()}
      {renderPopup()}
    </div>
  );
}
