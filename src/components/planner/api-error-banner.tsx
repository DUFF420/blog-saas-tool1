import { AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ApiErrorBannerProps {
    error: string | null;
    onDismiss: () => void;
}

export function ApiErrorBanner({ error, onDismiss }: ApiErrorBannerProps) {
    if (!error) return null;

    // Only show for specific API issues
    const isQuota = error === 'QUOTA_EXCEEDED';
    const isAuth = error === 'NO_API_KEY' || error === 'INVALID_API_KEY';

    if (!isQuota && !isAuth) return null;

    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r shadow-sm flex items-start justify-between">
            <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                <div>
                    <h3 className="text-amber-800 font-semibold text-sm">
                        {isQuota ? 'API Credit Limit Reached' : 'API Configuration Issue'}
                    </h3>
                    <p className="text-amber-700 text-sm mt-1">
                        {isQuota
                            ? "You have run out of AI generation credits. To continue using the generator, please contact support."
                            : "The AI system is not configured correctly. Please check your API keys."
                        }
                    </p>
                    <p className="text-amber-800 text-sm font-bold mt-2">
                        Contact: lukeduff00@gmail.com
                    </p>
                </div>
            </div>
            <button
                onClick={onDismiss}
                className="text-amber-500 hover:text-amber-700 transition"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}
