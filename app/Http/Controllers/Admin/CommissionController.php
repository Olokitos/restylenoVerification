<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionRecord;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CommissionController extends Controller
{
    /**
     * Show commission dashboard
     */
    public function index()
    {
        // Total commissions
        $totalCommissions = CommissionRecord::sum('amount');
        
        // This month's commissions
        $thisMonthCommissions = CommissionRecord::whereMonth('collected_at', now()->month)
            ->whereYear('collected_at', now()->year)
            ->sum('amount');
        
        // Today's commissions
        $todayCommissions = CommissionRecord::whereDate('collected_at', today())
            ->sum('amount');
        
        // Recent transactions
        $recentTransactions = Transaction::with(['product', 'buyer', 'seller'])
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->take(10)
            ->get();
        
        // Commission chart data (last 30 days)
        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $commission = CommissionRecord::whereDate('collected_at', $date)->sum('amount');
            $chartData[] = [
                'date' => $date->format('M j'),
                'amount' => $commission
            ];
        }
        
        // Quick stats
        $totalTransactions = Transaction::where('status', 'completed')->count();
        $averageCommission = $totalTransactions > 0 ? $totalCommissions / $totalTransactions : 0;
        
        return Inertia::render('admin/commissions/index', [
            'stats' => [
                'total_commissions' => $totalCommissions,
                'this_month_commissions' => $thisMonthCommissions,
                'today_commissions' => $todayCommissions,
                'total_transactions' => $totalTransactions,
                'average_commission' => $averageCommission,
            ],
            'recentTransactions' => $recentTransactions,
            'chartData' => $chartData,
        ]);
    }
    
    /**
     * Show detailed commission report
     */
    public function report(Request $request)
    {
        $query = CommissionRecord::with(['transaction.product', 'transaction.buyer', 'seller']);
        
        // Date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('collected_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('collected_at', '<=', $request->end_date);
        }
        
        // Seller filter
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }
        
        // Transaction status filter
        if ($request->filled('status')) {
            $query->whereHas('transaction', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }
        
        $commissions = $query->orderBy('collected_at', 'desc')->paginate(20);
        
        // Get sellers for filter dropdown
        $sellers = Transaction::with('seller')
            ->where('status', 'completed')
            ->get()
            ->pluck('seller')
            ->unique('id')
            ->values();
        
        // Summary totals
        $summary = [
            'total_amount' => $query->sum('amount'),
            'total_transactions' => $query->count(),
            'average_commission' => $query->count() > 0 ? $query->sum('amount') / $query->count() : 0,
        ];
        
        return Inertia::render('admin/commissions/report', [
            'commissions' => $commissions,
            'sellers' => $sellers,
            'filters' => $request->only(['start_date', 'end_date', 'seller_id', 'status']),
            'summary' => $summary,
        ]);
    }
    
    /**
     * Export commission data as a PDF report
     */
    public function export(Request $request)
    {
        $query = CommissionRecord::with(['transaction.product', 'transaction.buyer', 'seller']);
        
        // Apply same filters as report
        if ($request->filled('start_date')) {
            $query->whereDate('collected_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('collected_at', '<=', $request->end_date);
        }
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }
        if ($request->filled('status')) {
            $query->whereHas('transaction', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }
        
        $commissions = $query->orderBy('collected_at', 'desc')->get();

        $summary = [
            'total_amount' => $commissions->sum('amount'),
            'total_transactions' => $commissions->count(),
            'average_commission' => $commissions->count() > 0 ? $commissions->avg('amount') : 0,
            'highest_commission' => $commissions->max('amount'),
        ];

        $filters = [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'seller_id' => $request->seller_id,
            'status' => $request->status,
        ];

        // Convert logo to base64 for PDF embedding
        $logoPath = public_path('logo.svg');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoContent = file_get_contents($logoPath);
            $logoBase64 = 'data:image/svg+xml;base64,' . base64_encode($logoContent);
        }

        $generatedAt = Carbon::now(config('app.timezone'));
        $pdf = Pdf::loadView('admin.commissions.report-pdf', [
            'generatedAt' => $generatedAt,
            'commissions' => $commissions,
            'summary' => $summary,
            'filters' => $filters,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'landscape')->setOptions([
            'defaultFont' => 'DejaVu Sans',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        $filename = 'commission_report_' . $generatedAt->format('Y-m-d_H-i-s') . '.pdf';

        return $pdf->download($filename);
    }
}