'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/supabase';

export default function DebugPropertiesPage() {
    const supabase = useSupabaseClient();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { data: properties, error } = await supabase
                .from('properties')
                .select('*')
                .limit(3);

            if (error) {
                console.error('Error fetching properties:', error);
                setData({ error: error.message });
            } else {
                setData(properties);
            }
            setLoading(false);
        }

        fetchData();
    }, [supabase]);

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Properties Data</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
