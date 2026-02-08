import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Health Check Endpoint
 * Purpose: Keep Supabase database active by performing periodic checks
 * Used by: GitHub Actions workflow to prevent project pausing
 */
export async function GET() {
    try {
        const startTime = Date.now();

        // Perform a simple database query to keep connection active
        const { data, error } = await supabase.rpc('get_debt_summary');

        if (error) {
            throw error;
        }

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                responseTime: `${responseTime}ms`,
                summary: data
            },
            message: 'Application is running and database is active'
        }, { status: 200 });

    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            message: 'Database connection failed'
        }, { status: 503 });
    }
}
