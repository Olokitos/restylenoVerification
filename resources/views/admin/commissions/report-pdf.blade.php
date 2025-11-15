<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Commission Report</title>
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
            padding: 24px 32px;
            background: #f7fafc;
            color: #1a202c;
            font-size: 12px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            border-bottom: 3px solid #22c55e;
            padding-bottom: 16px;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .brand-text {
            display: flex;
            flex-direction: column;
        }
        .brand-name {
            font-size: 32px;
            font-weight: 700;
            color: #15803d;
            margin: 0;
            letter-spacing: 2px;
        }
        .brand-tagline {
            font-size: 14px;
            color: #16a34a;
            margin-top: 4px;
            font-weight: 500;
        }
        .meta {
            text-align: right;
            font-size: 11px;
            color: #4a5568;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .meta-label {
            font-weight: 600;
            color: #64748b;
        }
        .title {
            font-size: 24px;
            font-weight: 700;
            margin: 8px 0 4px 0;
            color: #0f172a;
        }
        .subtitle {
            font-size: 12px;
            color: #475569;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 24px;
        }
        .summary-card {
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            padding: 14px;
        }
        .summary-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
        }
        .summary-value {
            margin-top: 6px;
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
        }
        .filters {
            margin-bottom: 16px;
            font-size: 11px;
            color: #475569;
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #22c55e;
        }
        .filters strong {
            color: #15803d;
        }
        .filters span {
            display: inline-block;
            margin-right: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
        }
        thead {
            background: #15803d;
            color: #ffffff;
        }
        th, td {
            padding: 10px 12px;
            text-align: left;
        }
        tbody tr:nth-child(odd) {
            background: #ffffff;
        }
        tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        th {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        td {
            font-size: 11px;
            color: #1e293b;
        }
        .status {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 600;
            background: #dcfce7;
            color: #15803d;
            text-transform: capitalize;
        }
        .footer {
            margin-top: 18px;
            font-size: 10px;
            color: #64748b;
            text-align: center;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        }
        .empty-state {
            text-align: center;
            padding: 36px 0;
            font-size: 12px;
            color: #475569;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">
                <div class="brand-text">
                    <div class="brand-name">RESTYLE</div>
                    <div class="brand-tagline">Waste less - Wear more</div>
                    <div class="title">Commission Dashboard Report</div>
                    <div class="subtitle">Sustainable Fashion Marketplace · Platform Analytics</div>
                </div>
            </div>
        </div>
        <div class="meta">
            <div class="meta-label">Generated:</div>
            <div>{{ $generatedAt->format('M d, Y g:i A') }}</div>
            <div class="meta-label" style="margin-top: 8px;">Report ID:</div>
            <div>{{ strtoupper($generatedAt->format('ymdHis')) }}</div>
        </div>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <div class="summary-label">Total Commission</div>
            <div class="summary-value">
                ₱{{ number_format($summary['total_amount'], 2) }}
            </div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Transactions</div>
            <div class="summary-value">{{ $summary['total_transactions'] }}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Average Commission</div>
            <div class="summary-value">
                ₱{{ number_format($summary['average_commission'], 2) }}
            </div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Top Commission</div>
            <div class="summary-value">
                ₱{{ number_format($summary['highest_commission'], 2) }}
            </div>
        </div>
    </div>

    <div class="filters">
        <strong>Filters Applied:</strong>
        <span>Start Date: {{ $filters['start_date'] ?? 'All' }}</span>
        <span>End Date: {{ $filters['end_date'] ?? 'All' }}</span>
        <span>Seller: {{ $filters['seller_id'] ?? 'All' }}</span>
        <span>Status: {{ $filters['status'] ?? 'All' }}</span>
    </div>

    @if($commissions->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Transaction</th>
                    <th>Seller</th>
                    <th>Buyer</th>
                    <th>Product</th>
                    <th>Sale Price</th>
                    <th>Commission</th>
                    <th>Earnings</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($commissions as $index => $commission)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ optional($commission->collected_at)->format('M d, Y g:i A') }}</td>
                        <td>#{{ $commission->transaction->id }}</td>
                        <td>{{ $commission->seller->name ?? 'N/A' }}</td>
                        <td>{{ $commission->transaction->buyer->name ?? 'N/A' }}</td>
                        <td>{{ $commission->transaction->product->title ?? 'Unknown' }}</td>
                        <td>{{ number_format($commission->transaction->sale_price, 2) }}</td>
                        <td>{{ number_format($commission->amount, 2) }}</td>
                        <td>{{ number_format($commission->transaction->seller_earnings, 2) }}</td>
                        <td>
                            <span class="status">{{ str_replace('_', ' ', strtolower($commission->transaction->status)) }}</span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty-state">
            No commission records found for the selected filters.
        </div>
    @endif

    <div class="footer">
        <strong>RESTYLE</strong> · Commission Analytics Report · Confidential · {{ $generatedAt->format('Y') }}<br>
        Waste less - Wear more · Sustainable Fashion Marketplace
    </div>
</body>
</html>

