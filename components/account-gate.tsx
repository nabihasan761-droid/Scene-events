"use client";

import { ArrowRight, Ticket, UserRound } from "lucide-react";
import Link from "next/link";
import { SceneDialog } from "./scene-dialog";

export function AccountGate({ intent, onClose }: { intent: string; onClose: () => void }) {
  return (
    <SceneDialog titleId="account-gate-title" onClose={onClose}>
      <div className="account-gate">
        <div className="account-gate-mark"><Ticket size={20} /></div>
        <p className="section-kicker"><span /> Your plans, all in one place</p>
        <h2 id="account-gate-title">Ready to make a plan?</h2>
        <p className="account-gate-copy">
          Create a free account to {intent}. You can also keep exploring without signing in.
        </p>
        <div className="account-choice-list">
          <Link className="account-choice primary" href="/auth/sign-up?next=%2F" onClick={onClose}>
            <span className="account-choice-icon"><UserRound size={17} /></span>
            <span><strong>Create an account</strong><small>Save plans and book tickets</small></span>
            <ArrowRight size={17} />
          </Link>
          <Link className="account-choice" href="/auth/login?next=%2F" onClick={onClose}>
            <span className="account-choice-icon"><ArrowRight size={17} /></span>
            <span><strong>Sign in</strong><small>Already have a scene. account?</small></span>
            <ArrowRight size={17} />
          </Link>
        </div>
        <button className="account-continue" onClick={onClose}>Continue exploring</button>
      </div>
    </SceneDialog>
  );
}
