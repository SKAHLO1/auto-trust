# 🔐 AutoTrust - Decentralized Freelance Escrow Platform

<div align="center">

**Secure escrow platform powered by MNEE blockchain**

[![MNEE Blockchain](https://img.shields.io/badge/Powered%20by-MNEE%20Blockchain-purple?style=for-the-badge)](https://mnee.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.0+-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Features](#-features) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📖 About

AutoTrust is a decentralized freelance marketplace that leverages **MNEE blockchain** to provide secure, transparent escrow services for task-based work. Built for the MNEE Blockchain Hackathon, it showcases the power and flexibility of MNEE while offering seamless integration with Ethereum-compatible smart contracts.

### 🎯 Problem Statement

Traditional freelance platforms often suffer from:
- High fees (15-20%)
- Payment disputes
- Delayed payments
- Lack of transparency
- Centralized control

### 💡 Our Solution

AutoTrust provides:
- **Blockchain-based escrow** - Funds locked securely until work completion
- **Dual payment support** - MNEE tokens (primary) + Sepolia ETH (alternative)
- **Zero platform fees** - Pay only blockchain gas fees
- **Transparent transactions** - All actions recorded on-chain
- **Automated dispute resolution** - Smart contract-enforced rules

---

## ✨ Features

### 🔐 Secure Escrow System
- **Smart contract-based** escrow protecting both employers and developers
- **Automated fund locking** - Payments held until task completion
- **Admin-controlled release** - Verified completion before payment
- **Automatic refunds** - Timeout-based refund mechanism

### 💰 Dual Payment Methods
- **MNEE Tokens** - Primary payment method showcasing MNEE blockchain
  - Fast transactions
  - Low fees
  - ERC-20 compatibility
- **Sepolia ETH** - Alternative payment for Ethereum users
  - MetaMask integration
  - Network auto-detection
  - Seamless experience

### 👥 Role-Based Dashboards
- **Employer Dashboard**
  - Create and manage tasks
  - Deposit escrow
  - Review submissions
  - Release payments
- **Developer Dashboard**
  - Browse available tasks
  - Submit work
  - Track payments
  - View earnings

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark mode support
- Real-time notifications
- Wallet connection modals
- Transaction status tracking

### 🔒 Authentication & Security
- Firebase Authentication
  - Email/Password
  - Google Sign-In
- Role-based access control
- Firestore security rules
- Protected API routes

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **Lucide Icons** - Beautiful icon set

### Blockchain
- **MNEE Blockchain** - Primary payment network
- **Solidity 0.8.0+** - Smart contract development
- **Ethers.js v6** - Web3 integration
- **MetaMask** - Wallet provider

### Backend
- **Node.js** - Backend runtime
- **Express.js** - API framework
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management

### Development
- **TypeScript** - Static typing
- **ESLint** - Code linting
- **Git** - Version control

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Git
- Firebase account
- MNEE tokens (for testing)
- Sepolia ETH (for gas fees)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/auto-trust-ai-escrow.git
   cd auto-trust-ai-escrow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy example environment file
   copy .env.local.example .env.local
   ```

4. **Edit `.env.local`** with your configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:5000/api

   # Smart Contract (Add after deployment)
   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 📦 Deployment

### Smart Contract Deployment

1. **Open Remix IDE** (https://remix.ethereum.org/)

2. **Create new file** `AutoTrustEscrowDual.sol`
   - Copy contract from `contracts/AutoTrustEscrowDual.sol`

3. **Compile contract**
   - Compiler version: 0.8.0 or higher
   - Enable optimization

4. **Deploy to Sepolia**
   - Connect MetaMask to Sepolia network
   - Select "Injected Provider - MetaMask"
   - Constructor parameter:
     ```
     _mneeTokenAddress: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
     ```
   - Click "Deploy" and confirm in MetaMask

5. **Copy contract address**
   - Save the deployed contract address
   - Add to `.env.local`:
     ```env
     NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xYourContractAddress
     ```

6. **Restart application**
   ```bash
   npm run dev
   ```

### Frontend Deployment

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

**Other Platforms**
- Build: `npm run build`
- Start: `npm start`
- Configure environment variables on your platform

---

## 📘 Usage

### For Employers

1. **Sign up** as an Employer
2. **Connect wallet** (MNEE or MetaMask)
3. **Create task**
   - Add title, description, requirements
   - Set budget (MNEE or ETH)
   - Set deadline
4. **Deposit escrow**
   - Approve token spending (for MNEE)
   - Confirm transaction
5. **Review submissions**
   - View developer submissions
   - Accept or reject work
6. **Release payment**
   - Confirm work completion
   - Release funds to developer

### For Developers

1. **Sign up** as a Developer
2. **Connect wallet** to receive payments
3. **Browse tasks**
   - Filter by budget, status
   - View task details
4. **Submit work**
   - Complete the task
   - Submit deliverables
5. **Receive payment**
   - Automatic release on approval
   - Funds sent to connected wallet

---

## 🏗 Architecture

### Smart Contract Flow

```
┌─────────────┐
│   Employer  │
└──────┬──────┘
       │ 1. Create Task
       │
       ▼
┌─────────────────────────────────┐
│   AutoTrust Escrow Contract     │
│                                 │
│  • depositMNEE(taskId, amount)  │
│  • depositETH(taskId)           │
│  • release(taskId, recipient)   │
│  • refund(taskId)               │
└─────────────┬───────────────────┘
              │
              │ 2. Funds Locked
              │
              ▼
┌──────────────────────────────┐
│   Escrow Storage             │
│   • depositor                │
│   • amount                   │
│   • paymentType (MNEE/ETH)   │
│   • status (Locked)          │
└──────────────┬───────────────┘
               │
               │ 3. Work Completed
               │
               ▼
┌─────────────────────┐
│   Admin/Platform    │
│   • Verify work     │
│   • Release payment │
└──────────┬──────────┘
           │
           │ 4. Release
           │
           ▼
┌─────────────────┐
│    Developer    │
│  Receives Funds │
└─────────────────┘
```

### Payment Flow

#### MNEE Token Payment
```
User → Approve MNEE → Contract holds tokens → Work done → Release to developer
```

#### ETH Payment
```
User → Send ETH → Contract holds ETH → Work done → Release to developer
```

---

## 🔑 Key Components

### Frontend

```
app/
├── auth/                    # Authentication pages
│   ├── login/
│   └── signup/
├── dashboard/               # User dashboards
│   ├── developer/          # Developer dashboard
│   ├── employer/           # Employer dashboard
│   └── page.tsx            # Route handler
├── tasks/                   # Task management
│   ├── [id]/               # Task details
│   └── create/             # Task creation
└── page.tsx                 # Landing page

lib/
├── contract-config.ts       # Contract addresses
├── web3.ts                  # Web3 integration
├── unified-escrow.ts        # Payment routing
├── wallet-context.tsx       # Wallet management
├── firebase-auth.ts         # Authentication
└── user-profile.ts          # User management

components/
├── ui/                      # shadcn/ui components
├── wallet-connect-button.tsx
└── connect-wallet-modal.tsx
```

### Smart Contract

```solidity
contract AutoTrustEscrowDual {
    // State
    mapping(string => Escrow) public escrows;
    
    // Core functions
    function depositMNEE(string taskId, uint256 amount) external;
    function depositETH(string taskId) external payable;
    function release(string taskId, address recipient) external;
    function refund(string taskId) external;
}
```

---

## 🔐 Security Features

- **Smart contract escrow** - Funds locked until verified completion
- **Admin-only controls** - Release/refund restricted to platform admin
- **Firebase security rules** - Role-based data access
- **Input validation** - Frontend and backend validation
- **Network verification** - Auto-detect and switch networks
- **Balance checking** - Prevent insufficient fund errors
- **Event logging** - All actions recorded on-chain

---

## 🌐 Network Configuration

### Sepolia Testnet
- **Chain ID**: 11155111 (`0xaa36a7`)
- **RPC**: https://rpc.sepolia.org
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### MNEE Token
- **Contract**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
- **Standard**: ERC-20
- **Decimals**: 18

---

## 🧪 Testing

### Local Testing
```bash
# Run development server
npm run dev

# Run in new terminal - Backend server (if separate)
cd backend
npm run dev
```

### Test Scenarios

1. **MNEE Payment Flow**
   - Connect MNEE wallet
   - Create task with MNEE budget
   - Deposit escrow
   - Submit work
   - Release payment

2. **ETH Payment Flow**
   - Connect MetaMask (Sepolia)
   - Get test ETH from faucet
   - Create task with ETH budget
   - Deposit escrow
   - Release payment

3. **Authentication**
   - Email/password signup
   - Google Sign-In
   - Role selection
   - Profile creation

---

## 🐛 Troubleshooting

### Contract Not Found
- Ensure contract is deployed to Sepolia
- Verify `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` in `.env.local`
- Restart dev server after adding environment variable

### Wrong Network
- Switch MetaMask to Sepolia network
- Enable "Show test networks" in MetaMask settings
- Click network switcher in app (auto-prompt)

### Wallet Connection Issues
- Unlock MetaMask
- Refresh page
- Clear browser cache
- Check MetaMask is installed and updated

### Transaction Fails
- Check sufficient balance (ETH or MNEE)
- Verify gas limits
- Ensure you're the admin (for release/refund)
- Check escrow exists and is locked

---

## 📊 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ Yes |
| `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` | Deployed escrow contract | ✅ Yes |
| `NEXT_PUBLIC_MNEE_TOKEN_ADDRESS` | MNEE token address | ⚠️ Pre-configured |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built for the MNEE Blockchain Hackathon by the AutoTrust team.

---

## 🙏 Acknowledgments

- **MNEE Blockchain** - For providing the infrastructure and inspiration
- **Ethereum Foundation** - For Solidity and smart contract standards
- **Vercel** - For Next.js and hosting platform
- **shadcn/ui** - For beautiful, accessible components
- **Firebase** - For authentication and database services

---

## 📞 Support

- **Documentation**: Check the code comments and inline documentation
- **Issues**: Open an issue on GitHub
- **MNEE Blockchain**: https://mnee.org

---

## 🎯 Roadmap

- [x] Core escrow functionality
- [x] Dual payment support (MNEE + ETH)
- [x] User authentication
- [x] Task creation and management
- [x] Smart contract integration
- [ ] Dispute resolution system
- [ ] Rating and review system
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Multi-chain support
- [ ] Governance token

---

## 📸 Screenshots

### Landing Page
Modern, responsive design with clear call-to-action

### Dashboard
Role-based dashboards for employers and developers

### Task Creation
Intuitive interface for creating tasks with escrow

### Wallet Connection
Easy wallet selection with support for MNEE and MetaMask

---

<div align="center">

**Built with ❤️ for the MNEE Blockchain Hackathon**

[⬆ Back to Top](#-autotrust---decentralized-freelance-escrow-platform)

</div>
