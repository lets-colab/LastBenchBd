import { describe, it, expect, vi } from 'vitest';
import { worlds, resolveScene, nextWorld, canAnimate, selectPublicRecords, createEntryTransition } from '../landing/cinematic-state.mjs';

describe('cinematic journey contract', () => {
 it('preserves real conversion destinations independently of the cinematic layer', () => {
  expect(worlds.malaysia.href).toBe('malaysia/');
  expect(worlds.classa.href).toBe('class-a/');
  expect(worlds.colab.href).toBe('https://co-lab-growth-os.lovable.app/');
 });
 it('rejects unknown or unsafe chapter routes without trapping navigation', () => {
  expect(resolveScene('#world/classa')).toEqual({ view:'world', world:'classa' });
  expect(resolveScene('#world/unknown')).toEqual({ view:'hub' });
  expect(resolveScene('#javascript:alert(1)')).toEqual({ view:'hub' });
  expect(resolveScene('#people')).toEqual({ view:'people' });
  expect(resolveScene('#company')).toEqual({ view:'company' });
 });
 it('suggests a continuation but never changes the current destination itself', () => {
  expect(nextWorld('malaysia')).toBe('classa');
  expect(nextWorld('classa')).toBe('colab');
  expect(nextWorld('colab')).toBe('hub');
 });
 it('respects reduced motion, save-data, user pause and hidden tabs', () => {
  expect(canAnimate({})).toBe(true);
  for (const flag of ['reducedMotion','saveData','paused','hidden']) expect(canAnimate({[flag]:true})).toBe(false);
 });
 it('publishes only separately approved records, even when queried directly', () => {
  const rows=[
   {name:'Private student',kind:'student',public:false,approved:true},
   {name:'Unverified creator',kind:'creator',public:true,approved:false},
   {name:'Approved creator',kind:'creator',public:true,approved:true},
   {name:'Approved product',kind:'product',public:true,approved:true}
  ];
  expect(selectPublicRecords(rows,'creator','APPROVED')).toEqual([rows[2]]);
  expect(selectPublicRecords(rows,'all','')).toEqual([rows[2],rows[3]]);
  expect(selectPublicRecords(undefined,'all','')).toEqual([]);
 });
 it('commits the chosen path even if the animation never completes', () => {
  vi.useFakeTimers();
  try{
   const commit=vi.fn();const entry=createEntryTransition(commit);let complete=()=>{};
   entry.begin('classa',(callback:()=>void)=>{complete=callback;});
   vi.advanceTimersByTime(650);
   expect(commit).toHaveBeenCalledExactlyOnceWith('classa');
   complete();expect(commit).toHaveBeenCalledTimes(1);
  }finally{vi.useRealTimers();}
 });
 it('finishes an interrupted entry once and cancels stale entry after navigation', () => {
  vi.useFakeTimers();
  try{
   const commit=vi.fn();const entry=createEntryTransition(commit);
   entry.begin('malaysia',()=>{});entry.finish();vi.runAllTimers();
   expect(commit).toHaveBeenCalledExactlyOnceWith('malaysia');
   entry.begin('colab',()=>{});entry.cancel();vi.runAllTimers();
   expect(commit).toHaveBeenCalledTimes(1);
  }finally{vi.useRealTimers();}
 });
});
