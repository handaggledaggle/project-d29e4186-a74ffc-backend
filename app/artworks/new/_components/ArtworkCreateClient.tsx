"use client";

import React, { useState } from 'react';

type ArtworkForm = {
  title: string;
  description: string;
  price: string;
  category: string;
  tags: string;
  // For simplicity, files will be an array of objects with original_url
  files: { original_url: string }[];
};

export default function ArtworkCreateClient() {
  const [form, setForm] = useState<ArtworkForm>({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    files: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value } as ArtworkForm));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // For demo, we will create object URLs and send them as original_url.
    const arr: { original_url: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // In production you'd upload to storage and get real URLs.
      const url = URL.createObjectURL(file);
      arr.push({ original_url: url });
    }
    setForm((s) => ({ ...s, files: arr }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category || undefined,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : undefined,
        files: form.files,
      } as any;

      const token = localStorage.getItem('access_token');
      const res = await fetch('https://backend-production-cdc4.up.railway.app/api/v1/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }
      const data = await res.json();
      setMessage(`Artwork created: ${data.artwork_id}`);
      // reset form
      setForm({ title: '', description: '', price: '', category: '', tags: '', files: [] });
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      <label>
        Title
        <input name="title" value={form.title} onChange={onChange} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={onChange} />
      </label>

      <label>
        Price
        <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required />
      </label>

      <label>
        Category
        <input name="category" value={form.category} onChange={onChange} />
      </label>

      <label>
        Tags (comma separated)
        <input name="tags" value={form.tags} onChange={onChange} />
      </label>

      <label>
        Files (images)
        <input type="file" multiple accept="image/*" onChange={onFileChange} />
      </label>

      <div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Artwork'}
        </button>
      </div>

      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </form>
  );
}
