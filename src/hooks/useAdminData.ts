import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';

const USERS_PATH = 'artifacts/korean-beautys-dispatch/users';
const ORDERS_PATH = 'artifacts/korean-beautys-dispatch/orders';
const BATCHES_PATH = 'artifacts/korean-beautys-dispatch/batches';
const RETURNS_PATH = 'artifacts/korean-beautys-dispatch/returns';
const ARCHIVE_ORDERS_PATH = 'artifacts/korean-beautys-dispatch/archive/orders';
const ARCHIVE_RETURNS_PATH = 'artifacts/korean-beautys-dispatch/archive/returns';

export function useAdminData() {
    const [users, setUsers] = useState<Record<string, any>>({});
    const [orders, setOrders] = useState<Record<string, any>>({});
    const [batches, setBatches] = useState<Record<string, any>>({});
    const [returns, setReturns] = useState<Record<string, any>>({});
    const [archiveOrders, setArchiveOrders] = useState<Record<string, any>>({});
    const [archiveReturns, setArchiveReturns] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = ref(db, USERS_PATH);
        const ordersRef = ref(db, ORDERS_PATH);
        const batchesRef = ref(db, BATCHES_PATH);
        const returnsRef = ref(db, RETURNS_PATH);
        const archOrdersRef = ref(db, ARCHIVE_ORDERS_PATH);
        const archReturnsRef = ref(db, ARCHIVE_RETURNS_PATH);

        let loadCount = 0;
        const checkLoading = () => {
            loadCount++;
            if (loadCount >= 6) setLoading(false);
        };

        const handleData = (setter: Function) => (snapshot: any) => {
            setter(snapshot.val() || {});
            checkLoading();
        };

        onValue(usersRef, handleData(setUsers));
        onValue(ordersRef, handleData(setOrders));
        onValue(batchesRef, handleData(setBatches));
        onValue(returnsRef, handleData(setReturns));
        onValue(archOrdersRef, handleData(setArchiveOrders));
        onValue(archReturnsRef, handleData(setArchiveReturns));

        return () => {
            off(usersRef);
            off(ordersRef);
            off(batchesRef);
            off(returnsRef);
            off(archOrdersRef);
            off(archReturnsRef);
        };
    }, []);

    return { users, orders, batches, returns, archiveOrders, archiveReturns, loading };
}
