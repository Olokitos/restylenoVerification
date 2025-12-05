<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sales History Report</title>
    <style>
        @font-face {
            font-family: 'DejaVu Sans';
            src: url("{{ storage_path('fonts/DejaVuSans.ttf') }}") format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        * {
            font-family: "DejaVu Sans", Arial, sans-serif;
        }
        body {
            margin: 0;
            padding: 30px;
            background: #ffffff;
            color: #333333;
            font-size: 11px;
        }
        .header {
            border-bottom: 3px solid #22c55e;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .logo-container {
            width: 250px;
            height: 250px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border-radius: 12px;
            padding: 8px;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
        }
        .logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        .logo-text {
            font-size: 72px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 1px;
            line-height: 1;
        }
        .brand-text {
            flex: 1;
            min-width: 0;
        }
        .brand-name {
            font-size: 32px;
            font-weight: 800;
            color: #22c55e;
            margin: 0;
            letter-spacing: 4px;
            text-transform: uppercase;
            line-height: 1.1;
        }
        .title {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
            margin: 8px 0 0 0;
            letter-spacing: 1px;
        }
        .subtitle {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
            font-weight: 500;
        }
        .tagline {
            font-size: 10px;
            color: #22c55e;
            margin-top: 4px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .meta {
            text-align: right;
            font-size: 10px;
            color: #64748b;
        }
        .meta-item {
            margin-bottom: 4px;
        }
        .generator-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #22c55e;
            padding: 12px 15px;
            border-radius: 4px;
            margin-top: 15px;
        }
        .generator-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .generator-name {
            font-size: 13px;
            font-weight: 600;
            color: #1a202c;
        }
        .generator-email {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 12px;
            margin-bottom: 25px;
        }
        .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
        }
        .summary-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 6px;
            font-weight: 600;
        }
        .summary-value {
            font-size: 16px;
            font-weight: 700;
            color: #1a202c;
        }
        .summary-value.earnings {
            color: #15803d;
        }
        .summary-value.commission {
            color: #dc2626;
        }
        .filters {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 10px;
            color: #475569;
        }
        .filters-title {
            font-weight: 600;
            margin-bottom: 5px;
        }
        .filters span {
            display: inline-block;
            margin-right: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        thead {
            background: #1a202c;
            color: #ffffff;
        }
        th {
            padding: 10px 12px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 600;
            border-bottom: 2px solid #0f172a;
        }
        tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }
        tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        td {
            padding: 10px 12px;
            font-size: 11px;
            color: #1a202c;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            text-transform: capitalize;
        }
        .status-completed {
            background: #dcfce7;
            color: #15803d;
        }
        .status-pending_payment {
            background: #fef3c7;
            color: #92400e;
        }
        .status-payment_submitted {
            background: #dbeafe;
            color: #1e40af;
        }
        .status-payment_verified {
            background: #d1fae5;
            color: #065f46;
        }
        .status-shipped {
            background: #e9d5ff;
            color: #6b21a8;
        }
        .status-delivered {
            background: #d1fae5;
            color: #065f46;
        }
        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }
        .text-right {
            text-align: right;
        }
        .text-bold {
            font-weight: 600;
        }
        .total-row {
            background: #1a202c !important;
            color: #ffffff !important;
        }
        .total-row td {
            color: #ffffff !important;
            font-weight: 600;
            padding: 12px;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #64748b;
            font-size: 12px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 9px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="header-top">
            <div class="brand">
                @if($logoBase64)
                <div class="logo-container">
                    <img src="{{ $logoBase64 }}" alt="Restyle Logo" class="logo" />
                </div>
                @else
                <div class="logo-container">
                    <div class="logo-text">R</div>
                </div>
                @endif
                <div class="brand-text">
                    <div class="brand-name">RESTYLE</div>
                    <div class="title">Sales History Report</div>
                    <div class="tagline">WASTE LESS · WEAR MORE</div>
                    <div class="subtitle">Sustainable Fashion Marketplace</div>
                </div>
            </div>
            <div class="meta">
                <div class="meta-item"><strong>Generated:</strong> {{ $generatedAt->format('M d, Y g:i A') }}</div>
                <div class="meta-item"><strong>Report ID:</strong> {{ strtoupper($generatedAt->format('ymdHis')) }}</div>
            </div>
        </div>
        
        <!-- Generator Information -->
        <div class="generator-box">
            <div class="generator-label">Report Generated By</div>
            <div class="generator-name">{{ $user->name }}</div>
            <div class="generator-email">{{ $user->email }}</div>
        </div>
    </div>

    <!-- Summary -->
    <div class="summary">
        <div class="summary-card">
            <div class="summary-label">Total Sales</div>
            <div class="summary-value">{{ $summary['total_transactions'] }}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value">₱{{ number_format($summary['total_sales'], 2) }}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Earnings</div>
            <div class="summary-value earnings">₱{{ number_format($summary['total_earnings'], 2) }}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Commissions</div>
            <div class="summary-value commission">₱{{ number_format($summary['total_commissions'], 2) }}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Completed</div>
            <div class="summary-value">{{ $summary['completed_transactions'] }}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Avg Sale Value</div>
            <div class="summary-value">₱{{ number_format($summary['average_sale_value'], 2) }}</div>
        </div>
    </div>

    <!-- Filters -->
    @if(!empty(array_filter($filters)))
    <div class="filters">
        <div class="filters-title">Filters Applied:</div>
        @if($filters['start_date'])
            <span><strong>Start Date:</strong> {{ $filters['start_date'] }}</span>
        @endif
        @if($filters['end_date'])
            <span><strong>End Date:</strong> {{ $filters['end_date'] }}</span>
        @endif
        @if($filters['status'] && $filters['status'] !== 'all')
            <span><strong>Status:</strong> {{ ucfirst(str_replace('_', ' ', $filters['status'])) }}</span>
        @endif
    </div>
    @endif

    <!-- Transactions Table -->
    @if($transactions->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Seller Name</th>
                    <th>Buyer Name</th>
                    <th class="text-right">Price</th>
                    <th>Date</th>
                    <th class="text-right">Earnings</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transactions as $index => $transaction)
                    <tr>
                        <td>{{ $user->name }}</td>
                        <td>{{ $transaction->buyer->name ?? 'N/A' }}</td>
                        <td class="text-right text-bold">₱{{ number_format($transaction->sale_price, 2) }}</td>
                        <td>{{ $transaction->created_at->format('M d, Y') }}</td>
                        <td class="text-right text-bold" style="color: #15803d;">₱{{ number_format($transaction->seller_earnings, 2) }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="2" class="text-right"><strong>Totals:</strong></td>
                    <td class="text-right"><strong>₱{{ number_format($summary['total_sales'], 2) }}</strong></td>
                    <td></td>
                    <td class="text-right"><strong>₱{{ number_format($summary['total_earnings'], 2) }}</strong></td>
                </tr>
            </tbody>
        </table>
    @else
        <div class="empty-state">
            No sales history found for the selected filters.
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        Generated by: {{ $user->name }} · Restyle Platform · {{ $generatedAt->format('Y') }} · Confidential Document
    </div>
</body>
</html>

