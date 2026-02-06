'use client';

import { useState } from "react";

export default function ProfilePage() {
    const [name, setName] = useState("Aditya");
    const [email, setEmail] = useState("aditya@email.com");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({
            name,
            email
        });
    }

    return (
        <div className="max-w-xl text-gray-600">
            <h1 className="text-2xl font-bold mb-6">
                Edit Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Name"
                />

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Email"
                />

                <button type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg">
                    Save Changes
                </button>
            </form>
        </div>

    );
}
