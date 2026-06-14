'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { guildsApi, shopApi, type ShopItem, type InventoryItem, usersApi } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ErrorBanner from '@/components/ErrorBanner';
import './shop.scss';

export default function ShopPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
  const [guildInventory, setGuildInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'user' | 'guild'>('all');
  const [userCoins, setUserCoins] = useState(0);
  const [guildGems, setGuildGems] = useState(0);
  const [userGuildId, setUserGuildId] = useState<string | undefined>(undefined);
  const [isGuildLeader, setIsGuildLeader] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
        const profile = await usersApi.me();
        setUserCoins(profile.coins);

        let guildId: string | null = null;
        let guildGemsVal = 0;
        let isLeader = false;

        try {
        const guildData = await guildsApi.getMyGuild();
        if (guildData) {
            guildId = guildData.id;
            isLeader = guildData.currentUserRole === 'leader';
            guildGemsVal = guildData.gems;
            setUserGuildId(guildId);
            setIsGuildLeader(isLeader);
            setGuildGems(guildGemsVal);
        }
        } catch {
        // User is not in a guild – ignore
        }

        const transformInventory = (inv: any): InventoryItem => ({
          id: inv.id,
          itemId: inv.itemId,
          name: inv.item.name,
          description: inv.item.description,
          icon: inv.item.icon,
          active: inv.active,
          type: inv.item.type,
          purchasedAt: inv.createdAt,
        });

        // Inside loadData:
        const [itemsData, userInvData, guildInvData] = await Promise.all([
          shopApi.listItems(),
          shopApi.getInventory('USER').then(data => data.map(transformInventory)),
          guildId ? shopApi.getInventory('GUILD', guildId).then(data => data.map(transformInventory)) : Promise.resolve([]),
        ]);

        setItems(itemsData);
        setUserInventory(userInvData);
        setGuildInventory(guildInvData);
    } catch (err) {
        setError('Failed to load shop');
    } finally {
        setLoading(false);
    }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requireAuth = () => {
    if (!isLoggedIn()) {
      router.push('/login');
      return false;
    }
    return true;
  };

  const handlePurchase = async (item: ShopItem, ownerType: 'USER' | 'GUILD') => {
    if (!requireAuth()) return;
    setSubmitting(true);
    try {
      await shopApi.purchase(item.id, ownerType, ownerType === 'GUILD' ? userGuildId! : undefined);
      await loadData();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (inventoryId: string, active: boolean) => {
  if (!requireAuth()) return;
  setSubmitting(true);
  try {
    await shopApi.setActive(inventoryId, active);

    const transformInventory = (inv: any): InventoryItem => ({
          id: inv.id,
          itemId: inv.itemId,
          name: inv.item.name,
          description: inv.item.description,
          icon: inv.item.icon,
          active: inv.active,
          type: inv.item.type,
          purchasedAt: inv.createdAt,
        });

        const [ userInv, guildInv] = await Promise.all([
          shopApi.getInventory('USER').then(data => data.map(transformInventory)),
          userGuildId ? shopApi.getInventory('GUILD', userGuildId).then(data => data.map(transformInventory)) : Promise.resolve([]),
        ]);
    setUserInventory(userInv);
    setGuildInventory(guildInv);
  } catch (err: any) {
    setError(err.message || 'Failed to update');
  } finally {
    setSubmitting(false);
  }
};

  const isItemOwned = (itemId: string) => {
    return [...userInventory, ...guildInventory].some(inv => inv.itemId === itemId);
  };

  const getInventoryForDisplay = () => {
    if (activeTab === 'user') return userInventory;
    if (activeTab === 'guild') return guildInventory;
    return [...userInventory, ...guildInventory];
  };

  if (loading) return <div className="shop"><p>Loading shop...</p></div>;

  return (
    <div className="shop">
      <div className="shop__particles"></div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="shop__hero pixel-card">
        <div className="shop__hero-content">
          <h1 className="pixel-title">🛒 DESIGN MASTER 🛒</h1>
          <p className="shop__hero-text">
            Customize your look with epic cosmetics. Purchase with coins or guild gems!
          </p>
        </div>
        <div className="shop__hero-stats">
          <div className="shop__stat">
            <span className="shop__stat-value">{userCoins}</span>
            <span className="shop__stat-label">💰 Coins</span>
          </div>
          {userGuildId && (
            <div className="shop__stat">
              <span className="shop__stat-value">{guildGems}</span>
              <span className="shop__stat-label">💎 Guild Gems</span>
            </div>
          )}
        </div>
      </div>

      <div className="shop__tabs">
        <button className={`shop__tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>✨ All Items</button>
        <button className={`shop__tab ${activeTab === 'user' ? 'active' : ''}`} onClick={() => setActiveTab('user')}>👤 My Inventory</button>
        {userGuildId && (
          <button className={`shop__tab ${activeTab === 'guild' ? 'active' : ''}`} onClick={() => setActiveTab('guild')}>🏰 Guild Inventory</button>
        )}
      </div>

      <div className="shop__items-grid">
        {activeTab === 'all' && items.map(item => {
          const owned = isItemOwned(item.id);
          return (
            <div key={item.id} className="shop-item pixel-card">
              <div className="shop-item__icon">{item.icon}</div>
              <div className="shop-item__info">
                <h3>{item.name} ({item.type})</h3>
                <p className="shop-item__desc">{item.description || 'No description'}</p>
                <div className="shop-item__prices">
                  {item.priceCoins > 0 && <span>💰 {item.priceCoins} coins</span>}
                  {item.priceGems > 0 && <span>💎 {item.priceGems} gems</span>}
                </div>
                {owned ? (
                  <span className="shop-item__owned">✓ Owned</span>
                ) : (
                  <div className="shop-item__actions">
                    {item.priceCoins > 0 && (
                      <button
                        className="pixel-btn pixel-btn--small"
                        onClick={() => handlePurchase(item, 'USER')}
                        disabled={submitting || userCoins < item.priceCoins}
                      >
                        Buy with coins
                      </button>
                    )}
                    {item.priceGems > 0 && userGuildId && isGuildLeader && (
                      <button
                        className="pixel-btn pixel-btn--small"
                        onClick={() => handlePurchase(item, 'GUILD')}
                        disabled={submitting || guildGems < item.priceGems}
                      >
                        Buy with gems
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {activeTab !== 'all' && getInventoryForDisplay().map(inv => (
          <div key={inv.id} className="shop-item pixel-card">
            <div className="shop-item__icon">{inv.icon}</div>
            <div className="shop-item__info">
              <h3>{inv.name}</h3>
              <p className="shop-item__desc">{inv.description || 'No description'}</p>
              <div className="shop-item__status">
                {inv.type == "BADGE" && (<span>Status: {inv.active ? '✅ Active' : '❌ Inactive'}</span>)}
                <span>Purchased: {new Date(inv.purchasedAt).toLocaleDateString()}</span>
              </div>
              {inv.type == "BADGE" && (
                <button
                  className="pixel-btn pixel-btn--small"
                  onClick={() => handleSetActive(inv.id, !inv.active)}
                  disabled={submitting}
                >
                  {inv.active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}