"use client";

import React from 'react';
import ArtworkCreateClient from './_components/ArtworkCreateClient';

export default function NewArtworkPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Create New Artwork</h1>
      <ArtworkCreateClient />
    </div>
  );
}
