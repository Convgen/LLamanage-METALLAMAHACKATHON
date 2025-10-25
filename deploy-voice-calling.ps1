# Voice Calling Deployment Script
# Run this after setting up Daily.co and ElevenLabs API keys

Write-Host "🎙️ Llamanage Voice Calling Deployment" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Green

# Check if Supabase CLI is installed
# Write-Host "Checking Supabase CLI..." -ForegroundColor Cyan
# $supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue

# if (-not $supabaseCli) {
#     Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
#     Write-Host "Install with: npm install -g supabase" -ForegroundColor Yellow
#     exit 1
# }

# Write-Host "✅ Supabase CLI found`n" -ForegroundColor Green

# Verify Edge Function exists
Write-Host "Verifying Edge Function..." -ForegroundColor Cyan
if (Test-Path "supabase/functions/handle-daily-call/index.ts") {
    Write-Host "✅ handle-daily-call Edge Function found`n" -ForegroundColor Green
} else {
    Write-Host "❌ Edge Function not found at supabase/functions/handle-daily-call/index.ts" -ForegroundColor Red
    exit 1
}

# Verify SQL migration exists
Write-Host "Verifying SQL migration..." -ForegroundColor Cyan
if (Test-Path "supabase/migrations/add_voice_calls.sql") {
    Write-Host "✅ Voice calls migration found`n" -ForegroundColor Green
} else {
    Write-Host "❌ Migration not found at supabase/migrations/add_voice_calls.sql" -ForegroundColor Red
    exit 1
}

# Prompt for API keys
Write-Host "`n🔑 API Key Configuration" -ForegroundColor Yellow
Write-Host "========================`n" -ForegroundColor Yellow

Write-Host "Before continuing, make sure you have:" -ForegroundColor Cyan
Write-Host "1. Daily.co API key (from https://dashboard.daily.co/developers)" -ForegroundColor White
Write-Host "2. ElevenLabs API key (from https://elevenlabs.io/app/settings)" -ForegroundColor White
Write-Host "`n"

$confirm = Read-Host "Have you added these keys to Supabase Edge Functions settings? (y/n)"

if ($confirm -ne "y") {
    Write-Host "`n📋 To add API keys:" -ForegroundColor Yellow
    Write-Host "1. Go to https://app.supabase.com" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Navigate to Settings → Edge Functions" -ForegroundColor White
    Write-Host "4. Click 'Add new secret' for each:" -ForegroundColor White
    Write-Host "   - DAILY_API_KEY" -ForegroundColor Cyan
    Write-Host "   - ELEVENLABS_API_KEY" -ForegroundColor Cyan
    Write-Host "`nRun this script again after adding the keys.`n" -ForegroundColor Yellow
    exit 0
}

# Deploy Edge Function
Write-Host "`n🚀 Deploying Edge Function..." -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

try {
    $deployOutput = npx supabase functions deploy handle-daily-call 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Edge Function deployed successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host $deployOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Deployment error: $_" -ForegroundColor Red
    exit 1
}

# Remind about SQL migration
Write-Host "`n📊 Database Migration" -ForegroundColor Yellow
Write-Host "===================`n" -ForegroundColor Yellow

Write-Host "Next step: Apply SQL migration" -ForegroundColor Cyan
Write-Host "1. Go to Supabase Dashboard → SQL Editor" -ForegroundColor White
Write-Host "2. Create new query" -ForegroundColor White
Write-Host "3. Copy contents from: supabase/migrations/add_voice_calls.sql" -ForegroundColor White
Write-Host "4. Click 'Run' to create voice_calls tables`n" -ForegroundColor White

$sqlConfirm = Read-Host "Have you applied the SQL migration? (y/n)"

if ($sqlConfirm -eq "y") {
    Write-Host "✅ Great! Migration applied`n" -ForegroundColor Green
} else {
    Write-Host "⚠️ Remember to apply the migration before testing`n" -ForegroundColor Yellow
}

# Final instructions
Write-Host "`n✨ Deployment Complete!" -ForegroundColor Green
Write-Host "====================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "2. Go to Dashboard → Voice Calls tab" -ForegroundColor White
Write-Host "3. Configure voice settings" -ForegroundColor White
Write-Host "4. Copy embed code for your website" -ForegroundColor White
Write-Host "5. Test the voice calling feature`n" -ForegroundColor White

Write-Host "📖 Full setup guide: VOICE_CALLING_SETUP.md`n" -ForegroundColor Yellow

Write-Host "🎉 Your AI voice assistant is ready!" -ForegroundColor Green
