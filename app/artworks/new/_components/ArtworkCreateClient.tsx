"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {};

export default function ArtworkCreateClient(_: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = {
        title,
        description,
        price: Number(price),
      };

      const res = await fetch('/api/v1/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // try to extract message
        let msg = res.statusText;
        try {
          const json = await res.json();
          if (json && json.message) msg = json.message;
        } catch (err) {
          // ignore
        }
        throw new Error(msg || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      // Navigate to created artwork page if id present, else refresh
      if (data && data.artwork_id) {
        router.push(`/artworks/${data.artwork_id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err && err.message ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
          min="0"
          required
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Creating...' : '작품 등록하기'}
        </button>
      </div>
    </form>
  );
}
